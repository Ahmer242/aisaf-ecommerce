/**
 * @file order.repository.ts
 * @module modules/order
 * @description Data access layer for Order processing and stock management.
 * Implements atomic database transactions ($transaction) with stock locking
 * (optimistic concurrency checking stock >= quantity) per arc.md §6.4.
 */

import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { prisma } from "../../prisma/client.js";
import { Errors } from "../../utils/AppError.js";

/** Input payload for creating an order inside a transaction */
export interface CreateOrderTxInput {
  userId: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  couponId?: string;
  shippingAddress: any;
  notes?: string;
  items: Array<{
    productId: string;
    variantId: string;
    name: string;
    sku: string;
    unitPrice: number;
    qty: number;
  }>;
  cartId: string;
}

export class OrderRepository {
  /**
   * Create an Order atomically inside a Prisma $transaction.
   * Performs stock locking for every item to prevent race conditions & overselling.
   * Decrements variant stock, creates order items, clears the cart, and updates coupon usage.
   * @param input - Detailed order metadata and items
   */
  async createOrderWithStockLocking(input: CreateOrderTxInput) {
    return prisma.$transaction(async (tx) => {
      // 1. Verify and lock stock for each requested variant
      for (const item of input.items) {
        // Fetch variant record
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });

        if (!variant) {
          throw Errors.notFound("VARIANT_NOT_FOUND", `Product variant ID ${item.variantId} no longer exists.`);
        }

        // Enforce stock check inside transaction to prevent race condition
        if (variant.stock < item.qty) {
          throw Errors.badRequest(
            "STOCK_LOCK_FAILED",
            `Item "${variant.product.name} (${variant.value})"` +
              ` is out of stock or does not have ${item.qty} units available. Current stock: ${variant.stock}.`,
          );
        }

        // Decrement variant stock
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.qty,
            },
          },
        });
      }

      // 2. Create Order record with nested OrderItems
      const order = await tx.order.create({
        data: {
          userId: input.userId,
          status: OrderStatus.PENDING,
          subtotal: input.subtotal,
          discountAmount: input.discountAmount,
          shippingAmount: input.shippingAmount,
          totalAmount: input.totalAmount,
          currency: input.currency || "PKR",
          paymentMethod: input.paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          couponId: input.couponId || null,
          shippingAddress: input.shippingAddress,
          notes: input.notes || null,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              name: item.name,
              sku: item.sku,
              unitPrice: item.unitPrice,
              qty: item.qty,
            })),
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      // 3. Clear user's cart items
      await tx.cartItem.deleteMany({
        where: { cartId: input.cartId },
      });

      // 4. Increment coupon usage count if applied
      if (input.couponId) {
        await tx.coupon.update({
          where: { id: input.couponId },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

      return order;
    });
  }

  /**
   * Find orders placed by a specific user ordered by latest created date.
   * @param userId - Unique user identifier
   */
  async findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find a single order by ID with items, user profile, and payment history.
   * @param id - Order ID
   */
  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                images: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        payments: true,
      },
    });
  }

  /**
   * Update the status of an existing order.
   * @param id - Target Order ID
   * @param status - New OrderStatus
   * @param paymentStatus - Optional updated PaymentStatus
   */
  async updateStatus(id: string, status: OrderStatus, paymentStatus?: PaymentStatus) {
    return prisma.order.update({
      where: { id },
      data: {
        status,
        ...(paymentStatus ? { paymentStatus } : {}),
      },
      include: {
        items: true,
        payments: true,
      },
    });
  }
}

/** Singleton instance of OrderRepository */
export const orderRepository = new OrderRepository();
