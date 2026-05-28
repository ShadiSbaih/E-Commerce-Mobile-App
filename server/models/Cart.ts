import mongoose, { Model } from "mongoose";
import type { ICart, ICartItem } from "../types/index.js";

const cartItemSchema = new mongoose.Schema<ICartItem>(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    size: { type: String },
  },
  { timestamps: true },
);

const cartSchema = new mongoose.Schema<ICart>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    totalAmount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

cartSchema.methods.calculateTotal = function (this: ICart): number {
  const total = this.items.reduce(
    (sum: number, item: ICartItem) => sum + item.price * item.quantity,
    0,
  );
  return (this.totalAmount = total);
};

const Cart: Model<ICart> = mongoose.model<ICart>("Cart", cartSchema);

export default Cart;
