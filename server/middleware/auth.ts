import type { NextFunction, Request, Response } from "express";
import User from "../models/User.js";

/** * Middleware to protect routes and ensure the user is authenticated.
 * It checks for a valid user session and attaches the user object to the request.
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = await req.auth();

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in auth middleware:", error);
    return res
      .status(500)
      .json({ success: false, message: "Authentication failed" });
  }
};

/**
 * Middleware to authorize users based on their roles.
 * @param roles - An array of allowed roles (e.g., ["admin", "user"])
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "User Role is NOT Authorized to access this route!",
      });
    }
    return next();
  };
};
