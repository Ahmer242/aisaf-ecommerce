import type { ProductDetail, ProductListItem } from "@aisaf/shared";
import type { ProductWithRelations } from "./product.repository.js";

export function decimalToNumber(
  value: { toNumber(): number } | number | null | undefined,
): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  return value.toNumber();
}

export function averageRating(reviews: { rating: number }[]): number | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function toListItem(product: ProductWithRelations): ProductListItem {
  const avg = averageRating(product.reviews);
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    ingredients: product.ingredients,
    price: decimalToNumber(product.price) ?? 0,
    compareAtPrice: decimalToNumber(product.compareAtPrice),
    brand: product.brand,
    categoryId: product.categoryId,
    images: product.images,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : undefined,
    tags: product.tags.map((t) => ({
      id: t.tag.id,
      name: t.tag.name,
      slug: t.tag.slug,
    })),
    averageRating: avg,
    inStock: product.variants.some((v) => v.stock > 0),
  };
}

export function toDetail(product: ProductWithRelations): ProductDetail {
  const base = toListItem(product);
  return {
    ...base,
    variants: product.variants.map((v) => ({
      id: v.id,
      productId: v.productId,
      attribute: v.attribute,
      value: v.value,
      sku: v.sku,
      stock: v.stock,
      priceOverride: decimalToNumber(v.priceOverride),
    })),
    reviewCount: product.reviews.length,
  };
}
