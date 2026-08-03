import { z } from "zod";

export const cartItemInputSchema = z.object({
  variantId: z.string().min(1),
  qty: z.number().int().positive().max(99),
});
export type CartItemInput = z.infer<typeof cartItemInputSchema>;

export const cartItemSchema = cartItemInputSchema.extend({
  id: z.string(),
  cartId: z.string(),
  name: z.string().optional(),
  sku: z.string().optional(),
  unitPrice: z.number().nonnegative().optional(),
  image: z.string().url().nullable().optional(),
});
export type CartItem = z.infer<typeof cartItemSchema>;

export const cartSchema = z.object({
  id: z.string(),
  userId: z.string().nullable().optional(),
  guestSessionId: z.string().nullable().optional(),
  items: z.array(cartItemSchema).default([]),
  subtotal: z.number().nonnegative().optional(),
});
export type Cart = z.infer<typeof cartSchema>;

export const wishlistItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  createdAt: z.coerce.date().optional(),
});
export type WishlistItem = z.infer<typeof wishlistItemSchema>;
