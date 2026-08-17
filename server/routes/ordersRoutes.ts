import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrders,
  previewOrder,
  updateOrderStatus,
} from "../controllers/OrdersController.js";
import { authorize, protect } from "../middleware/auth.js";
import {
  objectIdParam,
  validateBody,
  validateQuery,
  createOrderSchema,
  updateOrderStatusSchema,
} from "../middleware/validate.js";
import { z } from "zod";

const OrderRouter = express.Router();

OrderRouter.use(protect);

// R8: Returns the real price breakdown before the user confirms checkout
OrderRouter.get("/preview", previewOrder);
OrderRouter.get("/", getOrders);
OrderRouter.get(
  "/admin/all",
  authorize("admin"),
  validateQuery(
    z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      status: z
        .enum(["placed", "processing", "shipped", "delivered", "cancelled"])
        .optional(),
    }),
  ),
  getAllOrders,
);
OrderRouter.get("/:id", objectIdParam("id"), getOrderById);
OrderRouter.post("/", validateBody(createOrderSchema), createOrder);
OrderRouter.put(
  "/:id/status",
  objectIdParam("id"),
  authorize("admin"),
  validateBody(updateOrderStatusSchema),
  updateOrderStatus,
);

export default OrderRouter;
