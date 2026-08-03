/**
 * @file order.service.ts
 * @module modules/order
 * @description Business logic layer for order processing.
 * Validates cart contents, coupon applicability, shipping costs, stock locking,
 * and creates order records.
 */

import type { CreateOrderInput, Order } from "@aisaf/shared";
import { Errors } from "../../utils/AppError.js";
import { prisma } from "../../prisma/client.js";
import { cartService } from "../cart/cart.service.js";
import { orderRepository } from "./order.repository.js";

/** Default flat shipping fee in PKR */
const FLAT_SHIPPING_FEE = 250;
/** Subtotal threshold in PKR for free shipping */
const FREE_SHIPPING_THRESHOLD = 3000;

export class OrderService {
  /**
   * Validate coupon code server-side per arc.md §6.3 rule engine.
   * @param code - Coupon code supplied by user
   * @param subtotal - Current cart subtotal
   * @param userId - User ID to check first-order status
   * @returns Coupon object with calculated discount amount
   */
  private async validateAndApplyCoupon(
    code: string,
    subtotal: number,
    userId: string,
  ): Promise<{ couponId: string; discountAmount: number }> {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw Errors.badRequest("INVALID_COUPON", "Coupon code is invalid or inactive.");
    }

    // 1. Check expiration date
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw Errors.badRequest("COUPON_EXPIRED", "This coupon has expired.");
    }

    // 2. Check total usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw Errors.badRequest("COUPON_LIMIT_REACHED", "This coupon has reached its maximum usage limit.");
    }

    // 3. Check minimum order subtotal
    if (coupon.minOrderValue !== null && subtotal < Number(coupon.minOrderValue)) {
      throw Errors.badRequest(
        "MIN_ORDER_NOT_MET",
        `Order subtotal must be at least Rs. ${coupon.minOrderValue} to use coupon "${coupon.code}".`,
      );
    }

    // 4. Check first-order-only requirement
    if (coupon.firstOrderOnly) {
      const priorOrder = await prisma.order.findFirst({
        where: { userId, status: { not: "CANCELLED" } },
      });
      if (priorOrder) {
        throw Errors.badRequest("FIRST_ORDER_ONLY", "This coupon is valid for your first order only.");
      }
    }

    // 5. Calculate discount amount
    let discountAmount = 0;
    const couponVal = Number(coupon.value);
    if (coupon.type === "PERCENT") {
      discountAmount = (subtotal * couponVal) / 100;
    } else {
      discountAmount = couponVal;
    }

    // Discount cannot exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);
    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      couponId: coupon.id,
      discountAmount,
    };
  }

  /**
   * Create a new Order for an authenticated user with stock locking.
   * @param userId - ID of the authenticated user
   * @param input - Order creation input (shippingAddress, paymentMethod, couponCode, notes)
   */
  async createOrder(userId: string, input: CreateOrderInput): Promise<Order> {
    // 1. Retrieve user's active cart
    const cart = await cartService.getOrCreateCart({ userId });

    if (!cart.items || cart.items.length === 0) {
      throw Errors.badRequest("EMPTY_CART", "Your cart is empty. Cannot place an order.");
    }

    // 2. Calculate subtotal & shipping fee
    const subtotal = cart.subtotal;
    const shippingAmount = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;

    // 3. Validate coupon if provided
    let couponId: string | undefined;
    let discountAmount = 0;

    if (input.couponCode) {
      const couponResult = await this.validateAndApplyCoupon(input.couponCode as string, subtotal, userId);
      couponId = couponResult.couponId;
      discountAmount = couponResult.discountAmount;
    }

    // 4. Calculate final total amount
    const totalAmount = Math.max(0, Math.round((subtotal - discountAmount + shippingAmount) * 100) / 100);

    // 5. Construct order items payload
    const orderItemsPayload = cart.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      name: `${item.name} (${item.variantValue})`,
      sku: item.sku,
      unitPrice: item.unitPrice,
      qty: item.qty,
    }));

    // 6. Execute order creation inside stock locking transaction
    const rawOrder = await orderRepository.createOrderWithStockLocking({
      userId,
      subtotal,
      discountAmount,
      shippingAmount,
      totalAmount,
      currency: "PKR",
      paymentMethod: input.paymentMethod as any,
      couponId,
      shippingAddress: input.shippingAddress,
      notes: input.notes ?? undefined,
      items: orderItemsPayload,
      cartId: cart.id,
    });

    // 7. Format and return typed Order object
    return {
      id: rawOrder.id,
      userId: rawOrder.userId,
      status: rawOrder.status as any,
      subtotal: Number(rawOrder.subtotal),
      discountAmount: Number(rawOrder.discountAmount),
      shippingAmount: Number(rawOrder.shippingAmount),
      totalAmount: Number(rawOrder.totalAmount),
      currency: rawOrder.currency,
      paymentMethod: rawOrder.paymentMethod as any,
      paymentStatus: rawOrder.paymentStatus as any,
      couponId: rawOrder.couponId,
      shippingAddress: rawOrder.shippingAddress as any,
      notes: rawOrder.notes,
      items: rawOrder.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        sku: item.sku,
        unitPrice: Number(item.unitPrice),
        qty: item.qty,
      })),
      createdAt: rawOrder.createdAt,
    };
  }

  /**
   * Retrieve orders belonging to the logged-in user.
   * @param userId - Target user ID
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    const rawOrders = await orderRepository.findByUserId(userId);
    return rawOrders.map((rawOrder) => ({
      id: rawOrder.id,
      userId: rawOrder.userId,
      status: rawOrder.status as any,
      subtotal: Number(rawOrder.subtotal),
      discountAmount: Number(rawOrder.discountAmount),
      shippingAmount: Number(rawOrder.shippingAmount),
      totalAmount: Number(rawOrder.totalAmount),
      currency: rawOrder.currency,
      paymentMethod: rawOrder.paymentMethod as any,
      paymentStatus: rawOrder.paymentStatus as any,
      couponId: rawOrder.couponId,
      shippingAddress: rawOrder.shippingAddress as any,
      notes: rawOrder.notes,
      items: rawOrder.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        sku: item.sku,
        unitPrice: Number(item.unitPrice),
        qty: item.qty,
      })),
      createdAt: rawOrder.createdAt,
    }));
  }

  /**
   * Retrieve a specific order by ID (ensuring requester owns the order or is admin).
   * @param orderId - Target Order ID
   * @param userId - Authenticated user ID requesting the order
   * @param isAdmin - Boolean flag indicating if requester has admin role
   */
  async getOrderById(orderId: string, userId: string, isAdmin = false): Promise<Order> {
    const rawOrder = await orderRepository.findById(orderId);

    if (!rawOrder) {
      throw Errors.notFound("ORDER_NOT_FOUND", "Order not found.");
    }

    if (!isAdmin && rawOrder.userId !== userId) {
      throw Errors.forbidden("You do not have permission to view this order.");
    }

    return {
      id: rawOrder.id,
      userId: rawOrder.userId,
      status: rawOrder.status as any,
      subtotal: Number(rawOrder.subtotal),
      discountAmount: Number(rawOrder.discountAmount),
      shippingAmount: Number(rawOrder.shippingAmount),
      totalAmount: Number(rawOrder.totalAmount),
      currency: rawOrder.currency,
      paymentMethod: rawOrder.paymentMethod as any,
      paymentStatus: rawOrder.paymentStatus as any,
      couponId: rawOrder.couponId,
      shippingAddress: rawOrder.shippingAddress as any,
      notes: rawOrder.notes,
      items: rawOrder.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        sku: item.sku,
        unitPrice: Number(item.unitPrice),
        qty: item.qty,
      })),
      createdAt: rawOrder.createdAt,
    };
  }
}

/** Singleton instance of OrderService */
export const orderService = new OrderService();
