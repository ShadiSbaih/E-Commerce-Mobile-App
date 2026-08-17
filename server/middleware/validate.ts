import type { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import mongoose from "mongoose";

// ─── Primitive helpers ───────────────────────────────────────────────────────

/** Validates that a route param is a valid MongoDB ObjectId. */
export const objectIdParam = (paramName = "id") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[paramName];
    if (!value || !mongoose.Types.ObjectId.isValid(String(value))) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName}: must be a valid MongoDB ObjectId`,
      });
    }
    return next();
  };
};

/** Generic body-validation middleware factory. */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body) as z.infer<T>;
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: err.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }
      return next(err);
    }
  };
}

/** Generic query-validation middleware factory. */
export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedQuery = schema.parse(req.query);

      // Express 5 exposes `req.query` through a getter, so assigning to it
      // throws: "Cannot set property query ... which has only a getter".
      // Define an own property with the validated/coerced values instead.
      Object.defineProperty(req, "query", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: parsedQuery,
      });
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid query parameters",
          errors: err.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }
      return next(err);
    }
  };
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const addToCartSchema = z.object({
  productId: z.string().min(1).refine((v) => mongoose.Types.ObjectId.isValid(v), {
    message: "productId must be a valid MongoDB ObjectId",
  }),
  quantity: z.number().int().min(1).default(1),
  size: z.string().max(20).optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0),
  size: z.string().max(20).optional(),
});

export const addressSchema = z.object({
  type: z.enum(["Home", "Work", "Other"]),
  street: z.string().min(2).max(200),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  zipCode: z.string().min(1).max(20),
  country: z.string().min(1).max(100),
  isDefault: z.boolean().optional().default(false),
});

export const createOrderSchema = z.object({
  shippingAddress: z.object({
    street: z.string().min(2).max(200),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    zipCode: z.string().min(1).max(20),
    country: z.string().min(1).max(100),
  }),
  paymentMethod: z.enum(["cash", "stripe"]).default("cash"),
  notes: z.string().max(500).optional(),
  paymentIntentId: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z
    .enum(["placed", "processing", "shipped", "delivered", "cancelled"])
    .optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
});

export const toggleWishlistSchema = z.object({
  productId: z.string().min(1).refine((v) => mongoose.Types.ObjectId.isValid(v), {
    message: "productId must be a valid MongoDB ObjectId",
  }),
});

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  icon: z.string().max(100).optional(),
  image: z.string().url().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const productsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    category: z.string().max(100).optional(),
    search: z.string().max(200).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    isFeatured: z.enum(["true", "false"]).optional(),
  })
  .strict();
