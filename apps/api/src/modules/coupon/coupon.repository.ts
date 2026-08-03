/**
 * @file coupon.repository.ts
 * @module modules/coupon
 * @description Data access layer for Coupon management.
 * Handles database operations for creating, updating, looking up, and deleting promotional coupons.
 */

import { CouponType } from "@prisma/client";
import { prisma } from "../../prisma/client.js";

/** Input metadata for creating a new promotional coupon */
export interface CreateCouponInput {
  code: string;
  type: CouponType;
  value: number;
  minOrderValue?: number;
  expiresAt?: Date;
  usageLimit?: number;
  firstOrderOnly?: boolean;
  isActive?: boolean;
}

export class CouponRepository {
  /**
   * Find a coupon by its unique code string.
   * @param code - Coupon code (e.g. WELCOME10)
   */
  async findByCode(code: string) {
    return prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
  }

  /**
   * Find a coupon by its unique ID.
   * @param id - Coupon ID
   */
  async findById(id: string) {
    return prisma.coupon.findUnique({
      where: { id },
    });
  }

  /**
   * Fetch all coupons in the system ordered by creation date.
   */
  async findAll() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Create a new promotional coupon.
   * @param input - Coupon metadata
   */
  async create(input: CreateCouponInput) {
    return prisma.coupon.create({
      data: {
        code: input.code.trim().toUpperCase(),
        type: input.type,
        value: input.value,
        minOrderValue: input.minOrderValue || null,
        expiresAt: input.expiresAt || null,
        usageLimit: input.usageLimit || null,
        firstOrderOnly: input.firstOrderOnly ?? false,
        isActive: input.isActive ?? true,
      },
    });
  }

  /**
   * Update an existing coupon.
   * @param id - Target Coupon ID
   * @param data - Updated fields
   */
  async update(id: string, data: Partial<CreateCouponInput>) {
    return prisma.coupon.update({
      where: { id },
      data: {
        ...(data.code ? { code: data.code.trim().toUpperCase() } : {}),
        ...(data.type ? { type: data.type } : {}),
        ...(data.value !== undefined ? { value: data.value } : {}),
        ...(data.minOrderValue !== undefined ? { minOrderValue: data.minOrderValue } : {}),
        ...(data.expiresAt !== undefined ? { expiresAt: data.expiresAt } : {}),
        ...(data.usageLimit !== undefined ? { usageLimit: data.usageLimit } : {}),
        ...(data.firstOrderOnly !== undefined ? { firstOrderOnly: data.firstOrderOnly } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  }

  /**
   * Delete a coupon by ID.
   * @param id - Coupon ID to delete
   */
  async delete(id: string) {
    return prisma.coupon.delete({
      where: { id },
    });
  }
}

/** Singleton instance of CouponRepository */
export const couponRepository = new CouponRepository();
