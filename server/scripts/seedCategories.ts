import Category from "../models/Category.js";

const DEFAULT_CATEGORIES = [
  { name: "Men", slug: "men", icon: "man-outline", displayOrder: 1 },
  { name: "Women", slug: "women", icon: "woman-outline", displayOrder: 2 },
  { name: "Kids", slug: "kids", icon: "happy-outline", displayOrder: 3 },
  { name: "Shoes", slug: "shoes", icon: "footsteps-outline", displayOrder: 4 },
  { name: "Bag", slug: "bag", icon: "briefcase-outline", displayOrder: 5 },
  { name: "Other", slug: "other", icon: "grid-outline", displayOrder: 6 },
];

export async function seedCategories() {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      console.log("🌱 Seeding default categories...");
      await Category.insertMany(DEFAULT_CATEGORIES);
      console.log("✅ Categories seeded successfully.");
    }
  } catch (error) {
    console.error("⚠️ Error seeding categories:", error);
  }
}
