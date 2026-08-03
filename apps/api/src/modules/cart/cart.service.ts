/**
 * @file cart.service.ts
 * @module modules/cart
 * @description Business logic layer for shopping cart operations.
 * Validates stock availability, calculates cart subtotal, formats response payloads,
 * and handles cart merging between guest sessions and registered users.
 */

import type { CartItemInput } from "@aisaf/shared";
import { Errors } from "../../utils/AppError.js";
import { prisma } from "../../prisma/client.js";
import { cartRepository } from "./cart.repository.js";

/** Identifier interface for finding or operating on a cart */
export interface CartIdentifier {
  userId?: string;
  guestSessionId?: string;
}

/** Formatted cart item payload returned to client */
export interface FormattedCartItem {
  id: string;
  cartId: string;
  variantId: string;
  productId: string;
  name: string;
  variantAttribute: string;
  variantValue: string;
  sku: string;
  unitPrice: number;
  qty: number;
  stock: number;
  image: string | null;
  itemTotal: number;
}

/** Formatted cart payload returned to client */
export interface FormattedCart {
  id: string;
  userId: string | null;
  guestSessionId: string | null;
  items: FormattedCartItem[];
  subtotal: number;
  totalItems: number;
}

export class CartService {
  /**
   * Format raw Prisma cart object with calculated subtotal, unit prices, and stock metadata.
   * @param rawCart - Database cart record with items, variants, and product details
   * @returns FormattedCart with calculated totals
   */
  private formatCartResponse(rawCart: any): FormattedCart {
    let subtotal = 0;
    let totalItems = 0;

    const items: FormattedCartItem[] = rawCart.items.map((item: any) => {
      const variant = item.variant;
      const product = variant.product;
      
      // Determine effective unit price (use priceOverride if specified on variant, else product base price)
      const unitPrice = variant.priceOverride
        ? Number(variant.priceOverride)
        : Number(product.price);

      const itemTotal = unitPrice * item.qty;
      subtotal += itemTotal;
      totalItems += item.qty;

      // Extract primary product image URL
      const image = product.images && product.images.length > 0 ? product.images[0] : null;

      return {
        id: item.id,
        cartId: item.cartId,
        variantId: item.variantId,
        productId: product.id,
        name: product.name,
        variantAttribute: variant.attribute,
        variantValue: variant.value,
        sku: variant.sku,
        unitPrice,
        qty: item.qty,
        stock: variant.stock,
        image,
        itemTotal,
      };
    });

    return {
      id: rawCart.id,
      userId: rawCart.userId || null,
      guestSessionId: rawCart.guestSessionId || null,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      totalItems,
    };
  }

  /**
   * Retrieve an existing cart or create a new one for the given user or guest session.
   * @param identifier - User ID or Guest Session ID
   */
  async getOrCreateCart(identifier: CartIdentifier): Promise<FormattedCart> {
    const { userId, guestSessionId } = identifier;

    if (!userId && !guestSessionId) {
      throw Errors.badRequest("MISSING_CART_IDENTIFIER", "Either userId or guestSessionId must be provided.");
    }

    let cart;
    if (userId) {
      cart = await cartRepository.findByUserId(userId);
    } else if (guestSessionId) {
      cart = await cartRepository.findByGuestSessionId(guestSessionId);
    }

    if (!cart) {
      cart = await cartRepository.createCart(userId, guestSessionId);
    }

    return this.formatCartResponse(cart);
  }

  /**
   * Add a product variant item to the cart after validating variant existence and stock levels.
   * @param identifier - User ID or Guest Session ID
   * @param input - Item input containing variantId and desired quantity
   */
  async addItem(identifier: CartIdentifier, input: CartItemInput): Promise<FormattedCart> {
    // 1. Verify variant exists and check current stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: input.variantId },
      include: { product: true },
    });

    if (!variant || !variant.product.isActive) {
      throw Errors.notFound("VARIANT_NOT_FOUND", "Product variant not found or inactive.");
    }

    // 2. Retrieve or create cart
    const cart = await this.getOrCreateCart(identifier);

    // 3. Calculate requested quantity including existing cart quantity
    const existingItem = cart.items.find((item) => item.variantId === input.variantId);
    const newTotalQty = (existingItem?.qty || 0) + input.qty;

    if (newTotalQty > variant.stock) {
      throw Errors.badRequest(
        "INSUFFICIENT_STOCK",
        `Only ${variant.stock} units available in stock. Cannot add ${input.qty} more.`,
      );
    }

    // 4. Perform database insert/update
    await cartRepository.addItem(cart.id, input.variantId, input.qty);

    // 5. Return updated cart
    return this.getOrCreateCart(identifier);
  }

  /**
   * Update the quantity of an existing cart item after validating stock.
   * @param identifier - User ID or Guest Session ID
   * @param variantId - Target Product Variant ID
   * @param qty - New quantity (must be > 0)
   */
  async updateItemQty(
    identifier: CartIdentifier,
    variantId: string,
    qty: number,
  ): Promise<FormattedCart> {
    if (qty <= 0) {
      return this.removeItem(identifier, variantId);
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw Errors.notFound("VARIANT_NOT_FOUND", "Product variant not found.");
    }

    if (qty > variant.stock) {
      throw Errors.badRequest(
        "INSUFFICIENT_STOCK",
        `Cannot set quantity to ${qty}. Only ${variant.stock} units currently available.`,
      );
    }

    const cart = await this.getOrCreateCart(identifier);

    const existingItem = cart.items.find((item) => item.variantId === variantId);
    if (!existingItem) {
      throw Errors.notFound("CART_ITEM_NOT_FOUND", "Item not found in cart.");
    }

    await cartRepository.updateItemQty(cart.id, variantId, qty);

    return this.getOrCreateCart(identifier);
  }

  /**
   * Remove a variant item from the cart.
   * @param identifier - User ID or Guest Session ID
   * @param variantId - Target Product Variant ID to remove
   */
  async removeItem(identifier: CartIdentifier, variantId: string): Promise<FormattedCart> {
    const cart = await this.getOrCreateCart(identifier);
    
    const existingItem = cart.items.find((item) => item.variantId === variantId);
    if (existingItem) {
      await cartRepository.removeItem(cart.id, variantId);
    }

    return this.getOrCreateCart(identifier);
  }

  /**
   * Clear all items from a user's or guest's cart.
   * @param identifier - User ID or Guest Session ID
   */
  async clearCart(identifier: CartIdentifier): Promise<FormattedCart> {
    const cart = await this.getOrCreateCart(identifier);
    await cartRepository.clearCart(cart.id);
    return this.getOrCreateCart(identifier);
  }

  /**
   * Merge a guest session cart into an authenticated user's cart upon login/register.
   * @param guestSessionId - Guest session identifier
   * @param userId - Target logged-in user identifier
   */
  async mergeGuestCart(guestSessionId: string, userId: string): Promise<FormattedCart> {
    if (!guestSessionId || !userId) {
      throw Errors.badRequest("INVALID_MERGE_PARAMS", "Both guestSessionId and userId are required to merge carts.");
    }

    await cartRepository.mergeGuestCartIntoUserCart(guestSessionId, userId);
    return this.getOrCreateCart({ userId });
  }
}

/** Singleton instance of CartService */
export const cartService = new CartService();
