import { z } from "zod";

export const variantAttributeSchema = z.enum(["SHADE", "SIZE"]);
export type VariantAttribute = z.infer<typeof variantAttributeSchema>;

export const productVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  attribute: variantAttributeSchema,
  value: z.string(),
  sku: z.string(),
  stock: z.number().int().nonnegative(),
  priceOverride: z.number().nonnegative().nullable().optional(),
});
export type ProductVariant = z.infer<typeof productVariantSchema>;

export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});
export type Tag = z.infer<typeof tagSchema>;

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  parentId: z.string().nullable().optional(),
});
export type Category = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  ingredients: z.string().nullable().optional(),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().nullable().optional(),
  brand: z.string().nullable().optional(),
  categoryId: z.string(),
  images: z.array(z.string().url()).default([]),
  isActive: z.boolean(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type Product = z.infer<typeof productSchema>;

export const productDetailSchema = productSchema.extend({
  category: categorySchema.optional(),
  tags: z.array(tagSchema).default([]),
  variants: z.array(productVariantSchema).default([]),
  averageRating: z.number().min(0).max(5).nullable().optional(),
  reviewCount: z.number().int().nonnegative().optional(),
});
export type ProductDetail = z.infer<typeof productDetailSchema>;

export const productListQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  category: z.string().optional(), // slug or id
  brand: z.string().optional(),
  tag: z.string().optional(), // slug
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  inStock: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      if (typeof v === "boolean") return v;
      return v === "true";
    }),
  sort: z
    .enum(["newest", "price_asc", "price_desc", "rating"])
    .default("newest")
    .optional(),
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(48).default(12).optional(),
});
export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const productListItemSchema = productSchema.extend({
  category: categorySchema.pick({ id: true, name: true, slug: true }).optional(),
  tags: z.array(tagSchema).default([]),
  averageRating: z.number().min(0).max(5).nullable().optional(),
  inStock: z.boolean().optional(),
});
export type ProductListItem = z.infer<typeof productListItemSchema>;

export const paginatedProductsSchema = z.object({
  items: z.array(productListItemSchema),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});
export type PaginatedProducts = z.infer<typeof paginatedProductsSchema>;

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().min(1),
  ingredients: z.string().optional(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  brand: z.string().max(120).optional(),
  categoryId: z.string().min(1),
  images: z.array(z.string().url()).default([]),
  tagIds: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  variants: z
    .array(
      z.object({
        attribute: variantAttributeSchema,
        value: z.string().min(1).max(80),
        sku: z.string().min(1).max(64),
        stock: z.number().int().nonnegative().default(0),
        priceOverride: z.number().positive().optional(),
      }),
    )
    .default([]),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;
