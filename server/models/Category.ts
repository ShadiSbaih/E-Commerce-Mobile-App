import mongoose, { Schema } from "mongoose";
import type { ICategory } from "../types/index.js";

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String, default: "grid-outline" },
    image: { type: String },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Category = mongoose.model<ICategory>("Category", categorySchema);

export default Category;
