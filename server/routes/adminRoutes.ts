import { getDashboardStats } from "../controllers/AdminController.js";
import { authorize, protect } from "../middleware/auth.js";

const AdminRouter = require("express").Router();

// GET /api/admin/stats
AdminRouter.get("/stats", protect, authorize("admin"), getDashboardStats);

export default AdminRouter;
