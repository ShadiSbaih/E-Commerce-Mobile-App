import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "../controllers/CategoryController.js";
import { authorize, protect } from "../middleware/auth.js";

const CategoryRouter = express.Router();

// Public routes
CategoryRouter.get("/", getCategories);
CategoryRouter.get("/:identifier", getCategory);

// Admin-only routes
CategoryRouter.post("/", protect, authorize("admin"), createCategory);
CategoryRouter.put("/:id", protect, authorize("admin"), updateCategory);
CategoryRouter.delete("/:id", protect, authorize("admin"), deleteCategory);

export default CategoryRouter;
