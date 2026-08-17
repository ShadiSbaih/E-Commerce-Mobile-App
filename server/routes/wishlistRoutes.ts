import express from "express";
import { getWishlist, toggleWishlist } from "../controllers/WishlistController.js";
import { protect } from "../middleware/auth.js";

const WishlistRouter = express.Router();

WishlistRouter.use(protect);

WishlistRouter.get("/", getWishlist);
WishlistRouter.post("/toggle", toggleWishlist);

export default WishlistRouter;
