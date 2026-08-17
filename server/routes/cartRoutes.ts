import express from "express";
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/CartController.js";
import { protect } from "../middleware/auth.js";
import {
  objectIdParam,
  validateBody,
  validateQuery,
  addToCartSchema,
  updateCartItemSchema,
} from "../middleware/validate.js";
import { z } from "zod";

const CartRouter = express.Router();

CartRouter.use(protect);

CartRouter.get("/", getCart);
CartRouter.post("/add", validateBody(addToCartSchema), addToCart);
CartRouter.put(
  "/item/:productId",
  objectIdParam("productId"),
  validateBody(updateCartItemSchema),
  updateCartItem,
);
CartRouter.delete(
  "/item/:productId",
  objectIdParam("productId"),
  validateQuery(z.object({ size: z.string().min(1).max(20) })),
  removeCartItem,
);
CartRouter.delete("/", clearCart);

export default CartRouter;
