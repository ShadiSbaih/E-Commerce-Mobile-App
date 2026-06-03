import { Webhook } from "svix";
import type { Request, Response } from "express";
import User from "../models/User.js";

export const clerkWebhook = async (req: Request, res: Response) => {
  try {
    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    if (!SIGNING_SECRET) {
      console.error(
        "Missing CLERK_WEBHOOK_SIGNING_SECRET environment variable.",
      );
      return res.status(500).send("Server configuration error");
    }

    // Initialize Svix with your secret
    const wh = new Webhook(SIGNING_SECRET);

    // Convert the raw buffer back to a string payload for verification
    const payload = req.body.toString();
    const headers = req.headers as Record<string, string>;

    // Verify the payload using Svix
    const event = wh.verify(payload, headers) as any;

    if (event.type === "user.created" || event.type === "user.updated") {
      const userData = {
        clerkId: event.data.id,
        name:
          `${event.data?.first_name || ""} ${event.data?.last_name || ""}`.trim() ||
          "Unknown",
        email: event.data?.email_addresses?.[0]?.email_address ?? "",
        image: event.data?.image_url,
      };

      // Atomic upsert pattern prevents race conditions
      await User.findOneAndUpdate({ clerkId: event.data.id }, userData, {
        upsert: true,
        new: true,
      });
    }

    const { id } = event.data;
    const eventType = event.type;
    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`,
    );

    return res.status(200).send("Webhook received");
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return res.status(400).send("Error verifying webhook");
  }
};
