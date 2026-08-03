/**
 * @file wishlist.service.ts
 * @module modules/wishlist
 * @description Business logic layer for managing customer wishlists and moving wishlist items to cart.
 */

import { Errors } from "../../utils/AppError.js";
import { prisma } from "../../prisma/client.js";
import { wishlistRepository } from "./wishlist.repository.js";
import { cartService } from "../cart/cart.service.js";

export class WishlistService {
  /**
   * Retrieve customer's saved wishlist items.
   */
  async getUserWishlist(userId: string) {
    return wishlistRepository.findByUserId(userId);
  }

  /**
   * Save a product to user's wishlist.
   */
  async addToWishlist(userId: string, productId: string) {
    // 1. Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw Errors.notFound("PRODUCT_NOT_FOUND", "Product not found.");
    }

    // 2. Check if already in wishlist
    const exists = await wishlistRepository.isItemInWishlist(userId, productId);
    if (exists) {
      return { message: "Product is already in wishlist." };
    }

    // 3. Add to wishlist
    return wishlistRepository.addItem(userId, productId);
  }

  /**
   * Remove a product from user's wishlist.
   */
  async removeFromWishlist(userId: string, productId: string) {
    await wishlistRepository.removeItem(userId, productId);
    return { success: true };
  }

  /**
   * Move an item from wishlist into customer's cart.
   */
  async moveToCart(userId: string, productId: string, variantId: string, qty: number = 1) {
    // 1. Verify product & variant
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });

    if (!variant) {
      throw Errors.notFound("VARIANT_NOT_FOUND", "Specified product variant not found.");
    }

    // 2. Add item to user cart
    const cart = await cartService.addItem({ userId }, { variantId, qty });

    // 3. Remove from wishlist
    await wishlistRepository.removeItem(userId, productId);

    return cart;
  }
}

export const wishlistService = new WishlistService();
