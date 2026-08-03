import { z } from "zod";
import { addressSchema } from "./user";

export const orderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const paymentMethodSchema = z.enum(["STRIPE", "JAZZCASH", "EASYPAISA"]);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const paymentStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "SUCCEEDED",
  "FAILED",
  "REFUNDED",
]);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const orderItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  variantId: z.string(),
  name: z.string(),
  sku: z.string(),
  unitPrice: z.number().nonnegative(),
  qty: z.number().int().positive(),
});
export type OrderItem = z.infer<typeof orderItemSchema>;

export const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: orderStatusSchema,
  subtotal: z.number().nonnegative(),
  discountAmount: z.number().nonnegative(),
  shippingAmount: z.number().nonnegative(),
  totalAmount: z.number().nonnegative(),
  currency: z.string().default("PKR"),
  paymentMethod: paymentMethodSchema,
  paymentStatus: paymentStatusSchema,
  couponId: z.string().nullable().optional(),
  shippingAddress: addressSchema,
  notes: z.string().nullable().optional(),
  items: z.array(orderItemSchema).default([]),
  createdAt: z.coerce.date().optional(),
});
export type Order = z.infer<typeof orderSchema>;

export const createOrderSchema = z.object({
  shippingAddress: addressSchema,
  paymentMethod: paymentMethodSchema,
  couponCode: z.string().trim().toUpperCase().optional(),
  notes: z.string().max(500).optional(),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const paymentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  provider: paymentMethodSchema,
  providerRef: z.string().nullable().optional(),
  amount: z.number().nonnegative(),
  currency: z.string().default("PKR"),
  status: paymentStatusSchema,
});
export type Payment = z.infer<typeof paymentSchema>;
