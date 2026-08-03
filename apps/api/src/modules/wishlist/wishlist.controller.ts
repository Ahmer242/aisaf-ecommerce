/**
 * @file wishlist.controller.ts
 * @module modules/wishlist
 * @description Controller handling HTTP requests for customer wishlist actions.
 */

import type { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { wishlistService } from "./wishlist.service.js";
import { z } from "zod";

const addWishlistSchema = z.object({
  productId: z.string().min(1),
});

const moveToCartSchema = z.object({
  variantId: z.string().min(1),
  qty: z.number().int().positive().default(1),
});

export class WishlistController {
  getWishlist = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const items = await wishlistService.getUserWishlist(userId);

    res.json({
      success: true,
      data: items,
    });
  });

  addToWishlist = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { productId } = addWishlistSchema.parse(req.body);

    const result = await wishlistService.addToWishlist(userId, productId);

    res.status(201).json({
      success: true,
      data: result,
    });
  });

  removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const productId = req.params.productId as string;

    const result = await wishlistService.removeFromWishlist(userId, productId);

    res.json({
      success: true,
      data: result,
    });
  });

  moveToCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const productId = req.params.productId as string;
    const { variantId, qty } = moveToCartSchema.parse(req.body);

    const cart = await wishlistService.moveToCart(userId, productId, variantId, qty);

    res.json({
      success: true,
      data: cart,
    });
  });
}

export const wishlistController = new WishlistController();
