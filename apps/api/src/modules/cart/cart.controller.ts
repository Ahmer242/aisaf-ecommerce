/**
 * @file cart.controller.ts
 * @module modules/cart
 * @description Express controller handlers for shopping cart routes.
 * Parses request inputs using Zod schemas, extracts user/guest identifiers,
 * and delegates business logic execution to CartService.
 */

import type { Request, Response } from "express";
import { cartItemInputSchema } from "@aisaf/shared";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { cartService, type CartIdentifier } from "./cart.service.js";

/** Helper function to extract user ID or guest session header from incoming HTTP request */
function extractCartIdentifier(req: Request): CartIdentifier {
  // 1. Check if user is authenticated (attached via optionalAuth or authGuard middleware)
  const userId = (req as any).auth?.sub || (req as any).user?.sub || (req as any).user?.id;

  // 2. Check for x-guest-session-id custom header
  const guestSessionHeader = req.headers["x-guest-session-id"];
  const guestSessionId = typeof guestSessionHeader === "string" ? guestSessionHeader : undefined;

  return { userId, guestSessionId };
}

export class CartController {
  /**
   * GET /api/cart
   * Retrieve the current cart for the authenticated user or guest session.
   */
  getCart = asyncHandler(async (req: Request, res: Response) => {
    const identifier = extractCartIdentifier(req);
    const cart = await cartService.getOrCreateCart(identifier);
    res.json({ success: true, data: cart });
  });

  /**
   * POST /api/cart/items
   * Add a product variant item to the cart.
   */
  addItem = asyncHandler(async (req: Request, res: Response) => {
    const identifier = extractCartIdentifier(req);
    // Validate request body using shared Zod schema
    const input = cartItemInputSchema.parse(req.body);

    const cart = await cartService.addItem(identifier, input);
    res.status(201).json({ success: true, data: cart });
  });

  /**
   * PATCH /api/cart/items/:variantId
   * Update quantity of a specific variant item in the cart.
   */
  updateItemQty = asyncHandler(async (req: Request, res: Response) => {
    const identifier = extractCartIdentifier(req);
    const variantId = req.params.variantId as string;
    const { qty } = req.body;

    const cart = await cartService.updateItemQty(identifier, variantId, Number(qty));
    res.json({ success: true, data: cart });
  });

  /**
   * DELETE /api/cart/items/:variantId
   * Remove a specific variant item from the cart.
   */
  removeItem = asyncHandler(async (req: Request, res: Response) => {
    const identifier = extractCartIdentifier(req);
    const variantId = req.params.variantId as string;

    const cart = await cartService.removeItem(identifier, variantId);
    res.json({ success: true, data: cart });
  });

  /**
   * DELETE /api/cart
   * Clear all items from the cart.
   */
  clearCart = asyncHandler(async (req: Request, res: Response) => {
    const identifier = extractCartIdentifier(req);
    const cart = await cartService.clearCart(identifier);
    res.json({ success: true, data: cart });
  });

  /**
   * POST /api/cart/merge
   * Merge guest session cart into logged-in user cart.
   */
  mergeCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.sub || (req as any).user?.id;
    const { guestSessionId } = req.body;

    const cart = await cartService.mergeGuestCart(guestSessionId, userId);
    res.json({ success: true, data: cart });
  });
}

/** Singleton instance of CartController */
export const cartController = new CartController();
