import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { clerkWebhook } from "./controllers/webhook.js";
import makeAdmin from "./scripts/makeAdmin.js";

const app = express();

//connect to database
await connectDB();

//webook route
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

await makeAdmin();

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
