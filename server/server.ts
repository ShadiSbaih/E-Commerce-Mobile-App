import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { connectDB, closeDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhook } from "./controllers/webhook.js";
import makeAdmin from "./scripts/makeAdmin.js";
import ProductRouter from "./routes/productRoutes.js";
import CartRouter from "./routes/cartRoutes.js";
import OrderRouter from "./routes/ordersRoutes.js";
import AddressRouter from "./routes/addressRoutes.js";
import AdminRouter from "./routes/adminRoutes.js";
import { seedProducts } from "./scripts/seedProducts.js";

// Validate Crucial Environment Variables Immediately
const requiredEnv = ["MONGO_URI","ADMIN_EMAIL","CLERK_PUBLISHABLE_KEY","CLERK_SECRET_KEY","CLERK_WEBHOOK_SIGNING_SECRET","CLOUDINARY_CLOUD_NAME","CLOUDINARY_API_KEY","CLOUDINARY_API_SECRET"];
for (const env of requiredEnv) {
  if (!process.env[env]) {
    console.error(`❌ Missing critical environment variable: ${env}`);
    process.exit(1);
  }
}

const app = express();
const port = process.env.PORT || 3000;

// Global Security Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS || "*" }));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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

let server: any;

async function startServer() {
  try {
    await connectDB();

    server = app.listen(port, () => {
      console.log(`🚀 Server safely running at http://localhost:${port}`);
    });

    // Run underlying setups asynchronously without stalling server initialization
    Promise.all([
      makeAdmin(),
      seedProducts(process.env.MONGO_URI as string),
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
