import mongoose, { Schema } from "mongoose";
import type { IProduct } from "../types/index.js";

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  images: [{ type: String, required: true }],
  sizes: [{ type: String, required: true }],
  category: {
    type: String,
    required: true,
    enum: ["Men", "Women", "Kids", "Shoes", "Bag", "Other"],
    default: "Other",
  },
  stock: { type: Number, required: true, min: 0, default: 0 },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

productSchema.index({ name: "text", description: "text" });


const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;