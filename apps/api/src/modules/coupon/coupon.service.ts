/**
 * @file coupon.service.ts
 * @module modules/coupon
 * @description Business logic layer for coupon validation, discount calculation, and administration.
 * Enforces coupon expiry, minimum spend threshold, usage cap, and first-order checks per arc.md §6.3.
 */

import { Errors } from "../../utils/AppError.js";
import { prisma } from "../../prisma/client.js";
import { couponRepository, type CreateCouponInput } from "./coupon.repository.js";

export class CouponService {
  /**
   * Validate a coupon code server-side and calculate discount amount per arc.md §6.3.
   * @param code - Coupon code entered by customer
   * @param subtotal - Current shopping cart subtotal
   * @param userId - Optional User ID for checking first order history
   */
  async validateCoupon(
    code: string,
    subtotal: number,
    userId?: string,
  ): Promise<{
    couponId: string;
    code: string;
    type: "PERCENT" | "FLAT";
    value: number;
    discountAmount: number;
    subtotalAfterDiscount: number;
  }> {
    const coupon = await couponRepository.findByCode(code);

    if (!coupon || !coupon.isActive) {
      throw Errors.badRequest("INVALID_COUPON", "Coupon code is invalid or inactive.");
    }

    // 1. Check expiration date
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw Errors.badRequest("COUPON_EXPIRED", "This coupon has expired.");
    }

    // 2. Check total usage cap
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw Errors.badRequest("COUPON_LIMIT_REACHED", "This coupon has reached its maximum usage limit.");
    }

    // 3. Check minimum order subtotal requirement
    if (coupon.minOrderValue !== null && subtotal < Number(coupon.minOrderValue)) {
      throw Errors.badRequest(
        "MIN_ORDER_NOT_MET",
        `Order subtotal must be at least Rs. ${coupon.minOrderValue} to use coupon "${coupon.code}".`,
      );
    }

    // 4. Check first-order-only restriction if userId is provided
    if (coupon.firstOrderOnly && userId) {
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
    const subtotalAfterDiscount = Math.round((subtotal - discountAmount) * 100) / 100;

    return {
      couponId: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: couponVal,
      discountAmount,
      subtotalAfterDiscount,
    };
  }

  /**
   * Admin: Create a new promotional coupon code.
   * @param input - Coupon metadata
   */
  async createCoupon(input: CreateCouponInput) {
    const existing = await couponRepository.findByCode(input.code);
    if (existing) {
      throw Errors.conflict("COUPON_EXISTS", `A coupon with code "${input.code}" already exists.`);
    }

    return couponRepository.create(input);
  }

  /**
   * Admin: Fetch list of all promotional coupons.
   */
  async getAllCoupons() {
    return couponRepository.findAll();
  }

  /**
   * Admin: Update coupon attributes.
   * @param id - Target Coupon ID
   * @param data - Updated fields
   */
  async updateCoupon(id: string, data: Partial<CreateCouponInput>) {
    const existing = await couponRepository.findById(id);
    if (!existing) {
      throw Errors.notFound("COUPON_NOT_FOUND", "Coupon not found.");
    }

    return couponRepository.update(id, data);
  }

  /**
   * Admin: Delete coupon.
   * @param id - Target Coupon ID
   */
  async deleteCoupon(id: string) {
    const existing = await couponRepository.findById(id);
    if (!existing) {
      throw Errors.notFound("COUPON_NOT_FOUND", "Coupon not found.");
    }

    return couponRepository.delete(id);
  }
}

/** Singleton instance of CouponService */
export const couponService = new CouponService();
