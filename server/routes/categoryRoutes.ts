import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "../controllers/CategoryController.js";
import { authorize, protect } from "../middleware/auth.js";
import {
  objectIdParam,
  validateBody,
  categoryCreateSchema,
} from "../middleware/validate.js";

const CategoryRouter = express.Router();

// Public routes
CategoryRouter.get("/", getCategories);
CategoryRouter.get("/:identifier", getCategory);

// Admin-only mutation routes
CategoryRouter.post(
  "/",
  protect,
  authorize("admin"),
  validateBody(categoryCreateSchema),
  createCategory,
);
CategoryRouter.put(
  "/:id",
  objectIdParam("id"),
  protect,
  authorize("admin"),
  validateBody(categoryCreateSchema.partial()),
  updateCategory,
);
CategoryRouter.delete(
  "/:id",
  objectIdParam("id"),
  protect,
  authorize("admin"),
  deleteCategory,
);

export default CategoryRouter;
