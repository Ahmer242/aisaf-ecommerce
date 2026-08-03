/**
 * @file cart.routes.ts
 * @module modules/cart
 * @description Express router configuration for shopping cart endpoints.
 * Registers routes for fetching cart, adding/updating/removing items, clearing cart,
 * and merging guest session carts upon user login.
 */

import { Router } from "express";
import { optionalAuth, authGuard } from "../../middlewares/authGuard.js";
import { cartController } from "./cart.controller.js";

const router = Router();

/**
 * Apply optionalAuth middleware to all cart endpoints so that if a valid
 * Bearer token is provided, req.auth is attached automatically.
 */
router.use(optionalAuth);

// GET /api/cart - Get user or guest session cart
router.get("/", cartController.getCart);

// POST /api/cart/items - Add item to cart
router.post("/items", cartController.addItem);

// PATCH /api/cart/items/:variantId - Update quantity for variant
router.patch("/items/:variantId", cartController.updateItemQty);

// DELETE /api/cart/items/:variantId - Remove variant from cart
router.delete("/items/:variantId", cartController.removeItem);

// DELETE /api/cart - Clear all items from cart
router.delete("/", cartController.clearCart);

// POST /api/cart/merge - Merge guest session cart into logged-in user cart (requires authGuard)
router.post("/merge", authGuard, cartController.mergeCart);

export const cartRouter = router;
