import type { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";

/** @desc    Get all products with pagination
 * @route   GET /api/products
 * @access  Public
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Number of products per page (default: 10)
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query: any = { isActive: true };

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
    if (req.files && (req.files as any).length > 0) {
      const uploadPromises = (req.files as any).map((file: any) => {
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

    let sizes = req.body.sizes || [];
    if (typeof sizes === "string") {
      try {
        sizes = JSON.parse(sizes);
      } catch (e) {
        sizes = sizes
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s !== "");
      }
    }

    // Ensure they are arrays
    if (!Array.isArray(sizes)) sizes = [sizes];

    if (images.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload at least one image" });
    }

    const productData = {
      ...req.body,
      images: images,
      sizes,
    };

    const product = await Product.create(productData);
    res.status(201).json({
      success: true,
      data: product,
    });
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

    if (req.body.existingImages) {
      if (Array.isArray(req.body.existingImages)) {
        images = [...req.body.existingImages];
      } else {
        try {
          images = JSON.parse(req.body.existingImages);
          if (!Array.isArray(images)) images = [images];
        } catch {
          images = [req.body.existingImages];
        }
      }
    }

    // Handle file uploads
    if (req.files && (req.files as any).length > 0) {
      const uploadPromises = (req.files as any).map((file: any) => {
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

    const updates = { ...req.body };

    if (req.body.sizes) {
      let sizes = req.body.sizes;

      if (typeof sizes === "string") {
        try {
          sizes = JSON.parse(sizes);
        } catch (e) {
          sizes = sizes
            .split(",")
            .map((s: string) => s.trim())
            .filter((s: string) => s !== "");
        }
      }
      if (!Array.isArray(sizes)) sizes = [sizes];
      updates.sizes = sizes;
    }

    if (
      req.body.existingImages ||
      (req.files && (req.files as any).length > 0)
    ) {
      updates.images = images;
    }

    delete updates.existingImages;

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
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

