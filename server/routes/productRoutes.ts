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
import  express  from 'express';


const ProductRouter = express.Router();

//get all products
ProductRouter.get("/", getProducts);

//get categories list
ProductRouter.get("/categories", getCategories);

//get single product
ProductRouter.get("/:id", getProduct);

//create product (Admin only)
ProductRouter.post(
  "/",
  protect,
  authorize("admin"),
  upload.array("images", 5),
  createProduct,
);

//update product (Admin only)
ProductRouter.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.array("images", 5),
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