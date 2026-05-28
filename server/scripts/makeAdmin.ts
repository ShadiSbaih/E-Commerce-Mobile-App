import { clerkClient } from "@clerk/express";
import User from "../models/User.js";

const makeAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    if (!email) {
      console.error("ADMIN_EMAIL is not defined in environment variables.");
      return;
    }
    const user = await User.findOneAndUpdate({ email }, { role: "admin" });
   
    if (user) {
      await clerkClient.users.updateUserMetadata(user.clerkId as string, {
        publicMetadata: { role: "admin" },
      });
      console.log(`User with email ${email} has been made an admin.`);
    }
    console.log(`Admin user initialized.`);    
  } catch (err: any) {
    console.error("Error making user an admin:", err?.message || err);
  }
};


export default makeAdmin;