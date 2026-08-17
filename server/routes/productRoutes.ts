import {
  createProduct,
  deleteProduct,
  getCategories,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/ProductController.js";
import { authorize, protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  objectIdParam,
  validateQuery,
  productsQuerySchema,
} from "../middleware/validate.js";
import express from "express";

const ProductRouter = express.Router();

// Public routes
ProductRouter.get("/", validateQuery(productsQuerySchema), getProducts);
ProductRouter.get("/categories", getCategories);
ProductRouter.get("/:id", objectIdParam("id"), getProduct);

// Admin-only mutation routes
ProductRouter.post(
  "/",
  protect,
  authorize("admin"),
  upload.array("images", 5),
  createProduct,
);
ProductRouter.put(
  "/:id",
  objectIdParam("id"),
  protect,
  authorize("admin"),
  upload.array("images", 5),
  updateProduct,
);
ProductRouter.delete(
  "/:id",
  objectIdParam("id"),
  protect,
  authorize("admin"),
  deleteProduct,
);

export default ProductRouter;