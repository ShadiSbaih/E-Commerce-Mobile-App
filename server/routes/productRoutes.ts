import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/ProductController.js";
import { authorize, protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const ProductRouter = require("express").Router();

//get all products
ProductRouter.get("/", getProducts);

//get single product
ProductRouter.get("/:id", getProduct);

//create product (Admin only)
ProductRouter.post(
  "/",
  upload.array("images", 5),
  protect,
  authorize("admin"),
  createProduct,
);

//update product (Admin only)
ProductRouter.put(
  "/:id",
  upload.array("images", 5),
  protect,
  authorize("admin"),
  updateProduct,
);

//delete product (Admin only)
ProductRouter.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteProduct,
);


export default ProductRouter;