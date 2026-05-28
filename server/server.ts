import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhook } from "./controllers/webhook.js";
import makeAdmin from "./scripts/makeAdmin.js";
import ProductRouter from "./routes/productRoutes.js";
import CartRouter from "./routes/cartRoutes.js";

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

const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});

/* Health check endpoint. This is a simple route that can be used to verify that the server is running and responsive. It returns a JSON object with a status of "ok". */
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("api/products", ProductRouter);
app.use("/api/cart", CartRouter);
/*  Error handling middleware. This should be defined after all other app.use() and routes calls.
    It catches any errors that occur in the route handlers and sends a 500 Internal Server Error response. */
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Error Middleware!", error: "Internal Server Error" });
});

await makeAdmin();

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
