export const PRODUCT_CATEGORIES = [
  "Men",
  "Women",
  "Kids",
  "Shoes",
  "Bag",
  "Other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type CreateProductDto = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  sizes: string[];
  isFeatured: boolean;
  images: ImagePickerAssetDto[];
};

export type ImagePickerAssetDto = {
  uri: string;
  name: string;
  type: string;
};

export function validateCreateProductDto(
  dto: CreateProductDto,
): string | null {
  if (!dto.name.trim()) return "Product name is required";
  if (!dto.description.trim()) return "Description is required";
  if (!Number.isFinite(dto.price) || dto.price < 0) {
    return "Price must be a valid non-negative number";
  }
  if (!Number.isInteger(dto.stock) || dto.stock < 0) {
    return "Stock must be a non-negative whole number";
  }
  if (!PRODUCT_CATEGORIES.includes(dto.category)) return "Invalid category";
  if (dto.sizes.length === 0) return "At least one size is required";
  if (dto.sizes.some((size) => !size.trim())) return "Sizes cannot be empty";
  if (dto.images.length < 1 || dto.images.length > 5) {
    return "Choose between 1 and 5 product images";
  }
  if (dto.images.some((image) => !image.uri || !image.type.startsWith("image/"))) {
    return "Every product image must be a valid image file";
  }
  return null;
}
