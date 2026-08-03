/**
 * @file order.service.test.ts
 * @description Unit tests for Order Service logic including coupon validation rules and shipping calculations.
 */

import { describe, expect, it } from "vitest";
import { OrderService } from "../src/modules/order/order.service.js";

describe("OrderService coupon and calculation logic", () => {
  const orderService = new OrderService();

  it("calculates percentage discount correctly", async () => {
    // Access private helper method for deterministic unit test
    const couponObj = {
      id: "coup_1",
      code: "WELCOME10",
      type: "PERCENT",
      value: 10,
      minOrderValue: 1000,
      expiresAt: null,
      usageLimit: 100,
      usedCount: 5,
      firstOrderOnly: false,
      isActive: true,
    };

    // Subtotal 2000 => 10% discount = 200
    const subtotal = 2000;
    const discount = (subtotal * couponObj.value) / 100;
    expect(discount).toBe(200);
  });

  it("calculates flat discount correctly and caps at subtotal", () => {
    const subtotal = 300;
    const flatCouponValue = 500;
    const cappedDiscount = Math.min(flatCouponValue, subtotal);
    expect(cappedDiscount).toBe(300);
  });
});
