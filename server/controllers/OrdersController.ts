import type { Request, Response } from "express";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import type { IProduct } from "../types/index.js";

// GET /api/orders/preview
// R8: Return the real price breakdown for the user's current cart so the
// frontend can display accurate totals (tax, shipping, total) before
// the user confirms the order — no order is created.
export const previewOrder = async (req: Request, res: Response) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }
    const subtotal = cart.totalAmount;
    const shippingCost = 5;
    const tax = parseFloat((subtotal * 0.1).toFixed(2));
    const totalAmount = parseFloat((subtotal + shippingCost + tax).toFixed(2));
    res.json({ success: true, data: { subtotal, shippingCost, tax, totalAmount } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders
// Get all orders for the logged-in user
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name images")
      .sort("-createdAt");

    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/:id
// Get order details
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "items.product",
      "name images",
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/orders
// Create an order from the user's cart
export const createOrder = async (req: Request, res: Response) => {
  // R3: Open a MongoDB session so every stock decrement is atomic.
  // If any item is out of stock or any write fails the whole transaction
  // is rolled back, preventing negative-stock race conditions.
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { shippingAddress, paymentMethod, notes } = req.body as {
      shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
      paymentMethod?: "cash" | "stripe";
      notes?: string;
      paymentIntentId?: string;
    };

    // Populate inside the session so the read is part of the transaction
    const cart = await Cart.findOne({ user: req.user._id })
      .populate<{
        items: Array<{
          product: IProduct & { _id: mongoose.Types.ObjectId };
          quantity: number;
          price: number;
          size?: string;
        }>;
      }>("items.product")
      .session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Build order items with atomic stock decrements
    const orderItems: Array<{
      product: mongoose.Types.ObjectId;
      name: string;
      quantity: number;
      price: number;
      size?: string;
    }> = [];

    for (const item of cart.items) {
      // findOneAndUpdate only matches if stock >= quantity → atomic check+decrement
      const updated = await Product.findOneAndUpdate(
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true, session },
      );

      if (!updated) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.product.name}"`,
        });
      }

      const orderItem: (typeof orderItems)[number] = {
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      };
      if (item.size) orderItem.size = item.size;
      orderItems.push(orderItem);
    }

    const subtotal = cart.totalAmount;
    const shippingCost = 5;
    const tax = parseFloat((subtotal * 0.1).toFixed(2));
    const totalAmount = subtotal + shippingCost + tax;
    const resolvedPaymentMethod = paymentMethod ?? "cash";

    const orderDoc = {
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: resolvedPaymentMethod,
      paymentStatus: resolvedPaymentMethod === "stripe" ? ("pending" as const) : ("paid" as const),
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      orderNumber: `ORD-${Date.now()}`,
      // Conditionally include optional string fields to satisfy exactOptionalPropertyTypes
      ...(notes ? { notes } : {}),
      ...((req.body as { paymentIntentId?: string }).paymentIntentId
        ? { paymentIntentId: (req.body as { paymentIntentId: string }).paymentIntentId }
        : {}),
    };

    const createdOrders = await Order.create([orderDoc], { session });
    const order = createdOrders[0];

    // Clear cart within the same transaction
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save({ session });

    await session.commitTransaction();
    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await session.endSession();
  }
};

// PUT /api/orders/:id/status
// Update order status (admin only)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderStatus, paymentStatus } = req.body as {
      orderStatus?: string;
      paymentStatus?: string;
    };
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // R4: Restore stock when an order transitions to "cancelled"
    const isCancelling =
      orderStatus === "cancelled" && order.orderStatus !== "cancelled";

    if (isCancelling) {
      await Promise.all(
        order.items.map((item) =>
          Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          }),
        ),
      );
    }

    if (orderStatus) {
      order.orderStatus = orderStatus as typeof order.orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus as typeof order.paymentStatus;
    }
    if (orderStatus === "delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/admin/all
// Get all orders — admin only
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query: Record<string, unknown> = {};

    if (status) query.orderStatus = status;

    const totalOrders = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("items.product", "name images")
      .sort("-createdAt")
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalOrders / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
