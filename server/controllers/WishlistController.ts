import type { Request, Response } from "express";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

/**
 * GET /api/wishlist
 * Get logged-in user's wishlist
 */
export const getWishlist = async (req: Request, res: Response) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products"
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.json({ success: true, data: wishlist.products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/wishlist/toggle
 * Toggle product in logged-in user's wishlist
 */
export const toggleWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const index = wishlist.products.findIndex(
      (p) => p.toString() === productId
    );

    if (index > -1) {
      wishlist.products.splice(index, 1);
    } else {
      wishlist.products.push(productId as any);
    }

    await wishlist.save();
    await wishlist.populate("products");

    res.json({ success: true, data: wishlist.products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
