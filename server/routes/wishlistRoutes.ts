import express from "express";
import { getWishlist, toggleWishlist } from "../controllers/WishlistController.js";
import { protect } from "../middleware/auth.js";
import { validateBody, toggleWishlistSchema } from "../middleware/validate.js";

const WishlistRouter = express.Router();

WishlistRouter.use(protect);

WishlistRouter.get("/", getWishlist);
WishlistRouter.post("/toggle", validateBody(toggleWishlistSchema), toggleWishlist);

export default WishlistRouter;
