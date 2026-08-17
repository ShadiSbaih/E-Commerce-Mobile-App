import type { Request, Response } from "express";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// get dashboard stats
// GET /api/admin/stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenueResult, recentOrders] =
      await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        // R11: Aggregate revenue in MongoDB — avoids loading all orders into memory
        Order.aggregate<{ _id: null; total: number }>([
          { $match: { orderStatus: { $ne: "cancelled" } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Order.find()
          .sort("-createdAt")
          .limit(5)
          .populate("user", "name email"),
      ]);

    const totalRevenue = revenueResult[0]?.total ?? 0;

    res.json({
      success: true,
      data: { totalUsers, totalProducts, totalOrders, totalRevenue, recentOrders },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
