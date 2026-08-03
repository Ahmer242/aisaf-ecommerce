/**
 * @file cart.repository.ts
 * @module modules/cart
 * @description Data access layer for Cart management.
 * Handles database operations for user carts, guest carts, cart items,
 * and guest-to-user cart merging using Prisma ORM.
 */

import { prisma } from "../../prisma/client.js";

/**
 * Repository containing Prisma database queries for Cart and CartItem entities.
 */
export class CartRepository {
  /**
   * Find a cart by User ID including all items and detailed variant/product information.
   * @param userId - Unique identifier of the authenticated user
   */
  async findByUserId(userId: string) {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  /**
   * Find a cart by Guest Session ID including all items and detailed variant/product information.
   * @param guestSessionId - Unique identifier generated for non-authenticated guest sessions
   */
  async findByGuestSessionId(guestSessionId: string) {
    return prisma.cart.findUnique({
      where: { guestSessionId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  /**
   * Create a new Cart for either an authenticated user or a guest session.
   * @param userId - Optional User ID
   * @param guestSessionId - Optional Guest Session ID
   */
  async createCart(userId?: string, guestSessionId?: string) {
    return prisma.cart.create({
      data: {
        userId: userId || null,
        guestSessionId: guestSessionId || null,
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Add an item to the cart or increment quantity if the variant already exists in the cart.
   * @param cartId - Target Cart ID
   * @param variantId - Target Product Variant ID
   * @param qty - Quantity to add
   */
  async addItem(cartId: string, variantId: string, qty: number) {
    return prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId,
          variantId,
        },
      },
      create: {
        cartId,
        variantId,
        qty,
      },
      update: {
        qty: {
          increment: qty,
        },
      },
    });
  }

  /**
   * Update the quantity of a specific item in the cart.
   * @param cartId - Target Cart ID
   * @param variantId - Target Product Variant ID
   * @param qty - New total quantity
   */
  async updateItemQty(cartId: string, variantId: string, qty: number) {
    return prisma.cartItem.update({
      where: {
        cartId_variantId: {
          cartId,
          variantId,
        },
      },
      data: { qty },
    });
  }

  /**
   * Remove a variant item from the cart.
   * @param cartId - Target Cart ID
   * @param variantId - Product Variant ID to remove
   */
  async removeItem(cartId: string, variantId: string) {
    return prisma.cartItem.delete({
      where: {
        cartId_variantId: {
          cartId,
          variantId,
        },
      },
    });
  }

  /**
   * Clear all items from a given cart.
   * @param cartId - Target Cart ID
   */
  async clearCart(cartId: string) {
    return prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }

  /**
   * Merge guest session cart items into an authenticated user's cart upon login/registration.
   * Transfers all items from the guest cart, combining quantities for matching variant IDs,
   * and then deletes the original guest cart.
   * @param guestSessionId - Guest session identifier
   * @param userId - Target logged-in user identifier
   */
  async mergeGuestCartIntoUserCart(guestSessionId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch guest cart
      const guestCart = await tx.cart.findUnique({
        where: { guestSessionId },
        include: { items: true },
      });

      if (!guestCart || guestCart.items.length === 0) {
        return;
      }

      // 2. Fetch or create target user cart
      let userCart = await tx.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!userCart) {
        userCart = await tx.cart.create({
          data: { userId },
          include: { items: true },
        });
      }

      // 3. Upsert guest items into user cart
      for (const guestItem of guestCart.items) {
        await tx.cartItem.upsert({
          where: {
            cartId_variantId: {
              cartId: userCart.id,
              variantId: guestItem.variantId,
            },
          },
          create: {
            cartId: userCart.id,
            variantId: guestItem.variantId,
            qty: guestItem.qty,
          },
          update: {
            qty: {
              increment: guestItem.qty,
            },
          },
        });
      }

      // 4. Delete original guest cart & items
      await tx.cart.delete({
        where: { id: guestCart.id },
      });
    });
  }
}

/** Singleton instance of CartRepository */
export const cartRepository = new CartRepository();
