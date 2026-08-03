/**
 * @file wishlist.routes.ts
 * @module modules/wishlist
 * @description Express router configuration for wishlist endpoints.
 */

import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { wishlistController } from "./wishlist.controller.js";

const router = Router();

router.use(authGuard);

router.get("/", wishlistController.getWishlist);
router.post("/", wishlistController.addToWishlist);
router.delete("/:productId", wishlistController.removeFromWishlist);
router.post("/:productId/move-to-cart", wishlistController.moveToCart);

export const wishlistRouter = router;
