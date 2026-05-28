import { verifyWebhook } from "@clerk/express/webhooks";
import type { Request, Response } from "express";
import User from "../models/User.js";

export const clerkWebhook = async (req: Request, res: Response) => {
  try {
    const event = await verifyWebhook(req);
    if (event.type === "user.created" || event.type === "user.updated") {
      const user = await User.findOne({ clerkId: event.data.id });

      const userData = {
        clerkId: event.data.id,
        name: `${event.data?.first_name || ""} ${event.data?.last_name || ""}`.trim() || "Unknown",
        email: event.data?.email_addresses?.[0]?.email_address ?? "",
        image: event.data?.image_url,
      };

      if (user) {
        await User.findOneAndUpdate({ clerkId: event.data.id }, userData);
      } else {
        await User.create(userData);
      }
    }

    const { id } = event.data;
    const eventType = event.type;
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
    console.log("Webhook payload:", event.data);

    return res.send("Webhook received");
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return res.status(400).send("Error verifying webhook");
  }
};

