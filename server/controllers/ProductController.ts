import type { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";

/** Escape a string so it is safe to embed inside a RegExp literal. */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** @desc    Get all products with pagination
 * @route   GET /api/products
 * @access  Public
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Number of products per page (default: 10)
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      minPrice,
      maxPrice,
      isFeatured,
    } = req.query;

    const query: any = { isActive: true };

    if (category && String(category).trim() !== "") {
      // Use escaped string to prevent ReDoS via user-controlled regex
      query.category = { $regex: new RegExp(`^${escapeRegex(String(category).trim())}$`, "i") };
    }

    if (search && String(search).trim() !== "") {
      // Prefer the $text index when available; fall back to escaped regex
      const escapedSearch = escapeRegex(String(search).trim());
      query.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true";
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/** @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 * URL Parameters: id - Product ID
 */
export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/** @desc    Create a new product
 * @route   POST /api/products
 * @access  Private (Admin only)
 * Request Body: JSON object with product details (name, description, price, category, etc.)
 * File Upload: Images can be uploaded as multipart/form-data with the key "images"
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    let images: string[] = [];

    // Handle file uploads
    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "ecom-app/products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result!.secure_url);
            },
          );
          uploadStream.end(file.buffer);
        });
      });
      images = await Promise.all(uploadPromises);
    }

    // R2: Whitelist allowed fields — never spread req.body directly
    type ProductCategory = "Men" | "Women" | "Kids" | "Shoes" | "Bag" | "Other";
    const { name, description, price, comparePrice, category, stock, isFeatured } = req.body as {
      name: string;
      description: string;
      price: string;
      comparePrice?: string;
      category: ProductCategory;
      stock: string;
      isFeatured?: string;
    };

    let sizes: string[] = req.body.sizes ?? [];
    if (typeof sizes === "string") {
      try {
        sizes = JSON.parse(sizes) as string[];
      } catch {
        sizes = (sizes as unknown as string)
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== "");
      }
    }
    if (!Array.isArray(sizes)) sizes = [sizes as unknown as string];

    if (images.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload at least one image" });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      ...(comparePrice !== undefined ? { comparePrice: Number(comparePrice) } : {}),
      category,
      stock: Number(stock ?? 0),
      isFeatured: isFeatured === "true",
      images,
      sizes,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/** @desc    Update an existing product
 * @route   PUT /api/products/:id
 * @access  Private (Admin only)
 * URL Parameters: id - Product ID
 * Request Body: JSON object with updated product details (name, description, price, category, etc.)
 * File Upload: Images can be uploaded as multipart/form-data with the key "images"
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    let images: string[] = [];

    // Preserve existing images passed from client
    if (req.body.existingImages) {
      if (Array.isArray(req.body.existingImages)) {
        images = [...(req.body.existingImages as string[])];
      } else {
        try {
          const parsed = JSON.parse(req.body.existingImages as string) as unknown;
          images = Array.isArray(parsed) ? parsed : [parsed as string];
        } catch {
          images = [req.body.existingImages as string];
        }
      }
    }

    // Handle new file uploads
    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "ecom-app/products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result!.secure_url);
            },
          );
          uploadStream.end(file.buffer);
        });
      });
      const newImages = await Promise.all(uploadPromises);
      images = [...images, ...newImages];
    }

    // R2: Whitelist allowed fields — never spread req.body directly
    const { name, description, price, comparePrice, category, stock, isFeatured, isActive } =
      req.body as Partial<{
        name: string;
        description: string;
        price: string;
        comparePrice: string;
        category: string;
        stock: string;
        isFeatured: string;
        isActive: string;
        existingImages: string | string[];
      }>;

    let sizes: string[] | undefined;
    if (req.body.sizes !== undefined) {
      let rawSizes: unknown = req.body.sizes;
      if (typeof rawSizes === "string") {
        try {
          rawSizes = JSON.parse(rawSizes);
        } catch {
          rawSizes = (rawSizes as string)
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s !== "");
        }
      }
      sizes = Array.isArray(rawSizes) ? rawSizes : [rawSizes as string];
    }

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (comparePrice !== undefined) updates.comparePrice = Number(comparePrice);
    if (category !== undefined) updates.category = category;
    if (stock !== undefined) updates.stock = Number(stock);
    if (isFeatured !== undefined) updates.isFeatured = isFeatured === "true";
    if (isActive !== undefined) updates.isActive = isActive === "true";
    if (sizes !== undefined) updates.sizes = sizes;
    if (req.body.existingImages !== undefined || (files && files.length > 0)) {
      updates.images = images;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error: any) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/** @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private (Admin only)
 * URL Parameters: id - Product ID
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((imageUrl) => {
        const publicIdMatch = imageUrl.match(/\/v\d+\/(.+)\.[a-z]+$/);
        const publicId = publicIdMatch ? publicIdMatch[1] : null;
        if (publicId) {
          return cloudinary.uploader.destroy(publicId);
        }
        return Promise.resolve();
      });
      await Promise.all(deletePromises);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/** @desc    Get all product categories with item count
 * @route   GET /api/products/categories
 * @access  Public
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", count: 1 } },
      { $sort: { name: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


