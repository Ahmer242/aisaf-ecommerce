/**
 * @file wishlist.repository.ts
 * @module modules/wishlist
 * @description Data access layer for customer wishlists.
 */

import { prisma } from "../../prisma/client.js";

export class WishlistRepository {
  /**
   * Fetch user's wishlist with product details
   */
  async findByUserId(userId: string) {
    return prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
            tags: { include: { tag: true } },
            variants: { select: { id: true, stock: true, priceOverride: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Check if a product is already in user's wishlist
   */
  async isItemInWishlist(userId: string, productId: string): Promise<boolean> {
    const item = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });
    return !!item;
  }

  /**
   * Add a product to user's wishlist
   */
  async addItem(userId: string, productId: string) {
    return prisma.wishlistItem.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: true,
      },
    });
  }

  /**
   * Remove a product from user's wishlist
   */
  async removeItem(userId: string, productId: string) {
    return prisma.wishlistItem.deleteMany({
      where: {
        userId,
        productId,
      },
    });
  }

  /**
   * Clear all items in user's wishlist
   */
  async clear(userId: string) {
    return prisma.wishlistItem.deleteMany({
      where: { userId },
    });
  }
}

export const wishlistRepository = new WishlistRepository();
