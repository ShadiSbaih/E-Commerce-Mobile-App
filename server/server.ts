import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import type { Server as HttpServer } from "http";
import { connectDB, closeDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhook } from "./controllers/webhook.js";
import makeAdmin from "./scripts/makeAdmin.js";
import ProductRouter from "./routes/productRoutes.js";
import CartRouter from "./routes/cartRoutes.js";
import OrderRouter from "./routes/ordersRoutes.js";
import AddressRouter from "./routes/addressRoutes.js";
import AdminRouter from "./routes/adminRoutes.js";
import WishlistRouter from "./routes/wishlistRoutes.js";
import CategoryRouter from "./routes/categoryRoutes.js";
import { seedProducts } from "./scripts/seedProducts.js";
import { seedCategories } from "./scripts/seedCategories.js";

// Validate Crucial Environment Variables Immediately
const requiredEnv = ["MONGO_URI","ADMIN_EMAIL","CLERK_PUBLISHABLE_KEY","CLERK_SECRET_KEY","CLERK_WEBHOOK_SIGNING_SECRET","CLOUDINARY_CLOUD_NAME","CLOUDINARY_API_KEY","CLOUDINARY_API_SECRET"];
for (const env of requiredEnv) {
  if (!process.env[env]) {
    console.error(`❌ Missing critical environment variable: ${env}`);
    process.exit(1);
  }
}

const app = express();
const port = Number(process.env.PORT) || 3000;

// R19: Parse ALLOWED_ORIGINS as a comma-separated list so multiple
// origins (e.g. "https://app.example.com,https://admin.example.com")
// are correctly passed to cors() as an array, not a single string.
const rawOrigins = process.env.ALLOWED_ORIGINS;
const corsOrigin: string | string[] | boolean =
  rawOrigins
    ? rawOrigins.split(",").map((o) => o.trim())
    : "*";

app.use(helmet());
app.use(cors({ origin: corsOrigin }));

// Rate limiter. During local development, Expo/React refresh and the admin
// screens can easily make more than 100 requests in a few minutes. Keep the
// production limit strict, but make the development limit configurable so a
// normal dev session cannot lock out product creation with HTTP 429.
const isProduction = process.env.NODE_ENV === "production";
const configuredRateLimit = Number(process.env.API_RATE_LIMIT_MAX);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:
    Number.isFinite(configuredRateLimit) && configuredRateLimit > 0
      ? configuredRateLimit
      : isProduction
        ? 100
        : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// Webhook Route (Must run BEFORE express.json())
app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhook);

// Standard Parsers
app.use(express.json());
app.use(clerkMiddleware());

// Utility Routes
app.get("/", (req: Request, res: Response) => res.send("Server is Live!"));
app.get("/api/health", (req: Request, res: Response) =>
  res.json({ status: "ok" }),
);

// Main API routes
app.use("/api/products", ProductRouter);
app.use("/api/cart", CartRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/addresses", AddressRouter);
app.use("/api/admin", AdminRouter);
app.use("/api/wishlist", WishlistRouter);
app.use("/api/categories", CategoryRouter);

// Centralized Error Handling Middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("🔥 Global Error Caught:", err.stack);
  res.status(500).json({
    message: "An internal server error occurred.",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error",
  });
});

// R12: Typed as HttpServer instead of any
let server: HttpServer | undefined;

async function startServer() {
  try {
    await connectDB();

    // Listen on all interfaces so a phone on the same LAN can reach the API.
    server = app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server safely running at http://0.0.0.0:${port}`);
    });

    // Run underlying setups asynchronously without stalling server initialization
    Promise.all([
      makeAdmin(),
      seedProducts(process.env.MONGO_URI as string),
      seedCategories(),
    ]).catch((err) =>
      console.error("⚠️ Background task failure during startup:", err),
    );
  } catch (error) {
    console.error("❌ Failed to initialize application:", error);
    process.exit(1);
  }
}

startServer();

// Graceful Shutdown Management
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Commencing graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log("👋 HTTP server closed.");
      await closeDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
