import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhook } from "./controllers/webhook.js";
import makeAdmin from "./scripts/makeAdmin.js";
import ProductRouter from "./routes/productRoutes.js";
import CartRouter from "./routes/cartRoutes.js";
import OrderRouter from "./routes/ordersRoutes.js";
import AddressRouter from "./routes/addressRoutes.js";
import AdminRouter from "./routes/adminRoutes.js";
import { seedProducts } from "./scripts/seedProducts.js";

// Create an Express application instance.
// This is the main app object that will be used to define routes and middleware.
const app = express();

//connect to database
await connectDB();

//webhook route
app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhook);

// Middleware
app.use(cors());
app.use(express.json());

// Clerk middleware
app.use(clerkMiddleware());

// Set the port from environment variable or default to 3000
const port = process.env.PORT || 3000;

// Basic route to check if server is running
app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});

// Health check endpoint. This is a simple route that can be used to verify that the server is running and responsive. It returns a JSON object with a status of "ok". */
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Main API routes
app.use("/api/products", ProductRouter);
app.use("/api/cart", CartRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/addresses", AddressRouter);
app.use("/api/admin", AdminRouter);

/*  Error handling middleware. This should be defined after all other app.use() and routes calls.
    It catches any errors that occur in the route handlers and sends a 500 Internal Server Error response. */
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Error Middleware!", error: "Internal Server Error" });
});

// Create an admin user if not exists when the server starts.
//  This is useful for testing and initial setup. The makeAdmin function should check if an admin user already exists and create one if it doesn't.
await makeAdmin();

//Seed dummy products if no products are present in the database. 
await seedProducts(process.env.MONGO_URI as string); // Call the seedProducts function to populate the database with dummy products if it's empty. This is useful for testing and development purposes.

// Start the server and listen on the specified port.
// The callback function logs a message to the console indicating that the server is running and provides the URL where it can be accessed.
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
