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

//Get order details
OrderRouter.get("/:id", protect, getOrderById);

//Create new order from cart
OrderRouter.post("/:id", protect, createOrder);

// update order status (admin only) - not implemented yet
OrderRouter.put("/:id/status", protect, authorize("admin"), updateOrderStatus);

//get all orders (admin only) - not implemented yet
OrderRouter.get("/admin", protect, authorize("admin"), getAllOrders);

export default OrderRouter;
