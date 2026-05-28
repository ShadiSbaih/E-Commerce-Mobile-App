import { verifyWebhook } from "@clerk/express/webhooks"
import type { Request, Response } from "express"



export const clerkWebhook = async (req: Request, res: Response) => {
  try {
    const event = await verifyWebhook(req)

    // Do something with payload
    // For this guide, log payload to console
    const { id } = event.data
    const eventType = event.type
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    console.log('Webhook payload:', event.data)

    return res.send('Webhook received')
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return res.status(400).send('Error verifying webhook')
  }
}