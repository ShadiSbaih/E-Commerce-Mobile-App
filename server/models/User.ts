import mongoose from "mongoose";
import type { IUser } from "../types/index.js";

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    clerkId: { type: String, required: true, unique: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);



const User = mongoose.model<IUser>("User", userSchema);

export default User;