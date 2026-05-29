import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from "../controllers/OrdersController.js";
import { authorize, protect } from "../middleware/auth.js";

const OrderRouter = express.Router();

//Get user orders
OrderRouter.get("/", protect, getOrders);

//get all orders (admin only)
OrderRouter.get("/admin/all", protect, authorize("admin"), getAllOrders);

//Get order details
OrderRouter.get("/:id", protect, getOrderById);

//Create new order from cart
OrderRouter.post("/", protect, createOrder);

// update order status (admin only)
OrderRouter.put("/:id/status", protect, authorize("admin"), updateOrderStatus);

export default OrderRouter;
