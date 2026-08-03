/**
 * @file coupon.service.test.ts
 * @description Unit tests for Coupon Service validation logic, calculations, and rules.
 */

import { describe, expect, it, vi } from "vitest";
import { CouponService } from "../src/modules/coupon/coupon.service.js";
import { couponRepository } from "../src/modules/coupon/coupon.repository.js";

describe("CouponService validation & calculations", () => {
  const couponService = new CouponService();

  it("calculates percentage discounts accurately", async () => {
    vi.spyOn(couponRepository, "findByCode").mockResolvedValueOnce({
      id: "coup_1",
      code: "SAVE20",
      type: "PERCENT",
      value: 20 as any,
      minOrderValue: null,
      expiresAt: null,
      usageLimit: null,
      usedCount: 0,
      firstOrderOnly: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await couponService.validateCoupon("SAVE20", 1000);
    expect(result.discountAmount).toBe(200);
    expect(result.subtotalAfterDiscount).toBe(800);
  });

  it("calculates flat discounts and caps at subtotal", async () => {
    vi.spyOn(couponRepository, "findByCode").mockResolvedValueOnce({
      id: "coup_2",
      code: "FLAT500",
      type: "FLAT",
      value: 500 as any,
      minOrderValue: null,
      expiresAt: null,
      usageLimit: null,
      usedCount: 0,
      firstOrderOnly: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await couponService.validateCoupon("FLAT500", 300);
    expect(result.discountAmount).toBe(300); // capped at subtotal
    expect(result.subtotalAfterDiscount).toBe(0);
  });

  it("rejects expired coupons", async () => {
    vi.spyOn(couponRepository, "findByCode").mockResolvedValueOnce({
      id: "coup_3",
      code: "EXPIRED",
      type: "PERCENT",
      value: 10 as any,
      minOrderValue: null,
      expiresAt: new Date(Date.now() - 86400000), // Yesterday
      usageLimit: null,
      usedCount: 0,
      firstOrderOnly: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(couponService.validateCoupon("EXPIRED", 1000)).rejects.toThrow("expired");
  });

  it("rejects when minimum order value is not met", async () => {
    vi.spyOn(couponRepository, "findByCode").mockResolvedValueOnce({
      id: "coup_4",
      code: "MIN5000",
      type: "PERCENT",
      value: 10 as any,
      minOrderValue: 5000 as any,
      expiresAt: null,
      usageLimit: null,
      usedCount: 0,
      firstOrderOnly: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(couponService.validateCoupon("MIN5000", 2500)).rejects.toThrow("Order subtotal must be at least");
  });
});
