import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/CartController.js";
import { protect } from "../middleware/auth.js";
import express from "express";

const CartRouter = express.Router();

//get user cart
CartRouter.get("/", protect, getCart);
//add item to cart
CartRouter.post("/add", protect, addToCart);
//update cart item quantity
CartRouter.put("/item/:productId", protect, updateCartItem);
//remove item from cart
CartRouter.delete("/item/:productId", protect, removeCartItem);
//clear cart
CartRouter.delete("/", protect, clearCart);

export default CartRouter;
