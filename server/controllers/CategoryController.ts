import type { Request, Response } from "express";
import Category from "../models/Category.js";

/**
 * @desc    Get all active categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      displayOrder: 1,
      name: 1,
    });
    res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single category by ID or Slug
 * @route   GET /api/categories/:identifier
 * @access  Public
 */
export const getCategory = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    let category = null;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(identifier);
    } else {
      category = await Category.findOne({ slug: identifier.toLowerCase() });
    }

    if (!category || !category.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error: any) {
    console.error("Error fetching category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private (Admin only)
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, icon, image, displayOrder } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }],
    });
    if (existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }

    const category = await Category.create({
      name,
      slug,
      icon: icon || "grid-outline",
      image,
      displayOrder: displayOrder || 0,
    });

    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update an existing category
 * @route   PUT /api/categories/:id
 * @access  Private (Admin only)
 */
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const updates = { ...req.body };

    if (updates.name) {
      updates.slug = updates.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error: any) {
    console.error("Error updating category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete (or deactivate) a category
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin only)
 */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
