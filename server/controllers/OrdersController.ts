// Get user orders

import type { Request, Response } from "express";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// GET /api/orders
// Get all orders for the logged-in user
export const getOrders = async (req: Request, res: Response) => {
  try {
    const query = { user: req.user._id };
    const orders = await Order.find(query)
      .populate("items.product", "name images")
      .sort("-createdAt");

    res.json({
      success: true,
      data: orders,
    });
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

// POST /api/orders/:id
// cancel order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    //verify stock
    const orderItems = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${(item.product as any).name}`,
        });
      }
      const orderItem: any = {
        product: item.product._id,
        name: (item.product as any).name,
        quantity: item.quantity,
        price: item.price,
      };
      if (item.size) {
        orderItem.size = item.size;
      }
      orderItems.push(orderItem);
      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    const subtotal = cart.totalAmount;
    const shippingCost = 2;
    const tax = parseFloat((subtotal * 0.1).toFixed(2));
    const totalAmount = subtotal + shippingCost + tax;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: req.body.paymentMethod || "cash",
      paymentStatus: req.body.paymentMethod === "stripe" ? "pending" : "paid",
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      notes,
      paymentIntentId: req.body.paymentIntentId,
      orderNumber: `ORD-${Date.now()}`,
    });

    if (req.body.paymentMethod === "stripe") {
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();
    }
    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/orders/:id/status
// update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
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

// Get all orders (admin)
// GET /api/orders/admin/all
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query: any = {};

    if (status) {
      query.orderStatus = status;
    }
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
