/**
 * @file wishlist.service.test.ts
 * @description Unit tests for Wishlist Service logic.
 */

import { describe, expect, it, vi } from "vitest";
import { WishlistService } from "../src/modules/wishlist/wishlist.service.js";
import { wishlistRepository } from "../src/modules/wishlist/wishlist.repository.js";
import { prisma } from "../src/prisma/client.js";

describe("WishlistService operations", () => {
  const wishlistService = new WishlistService();

  it("throws notFound error if adding a non-existent product", async () => {
    vi.spyOn(prisma.product, "findUnique").mockResolvedValueOnce(null);

    await expect(wishlistService.addToWishlist("user_1", "invalid_prod")).rejects.toThrow("Product not found");
  });

  it("adds item to wishlist when product exists and not already saved", async () => {
    vi.spyOn(prisma.product, "findUnique").mockResolvedValueOnce({
      id: "prod_1",
      name: "Hydrating Mask",
    } as any);

    vi.spyOn(wishlistRepository, "isItemInWishlist").mockResolvedValueOnce(false);
    vi.spyOn(wishlistRepository, "addItem").mockResolvedValueOnce({
      id: "w_1",
      userId: "user_1",
      productId: "prod_1",
      createdAt: new Date(),
    } as any);

    const res = await wishlistService.addToWishlist("user_1", "prod_1");
    expect(res).toHaveProperty("id", "w_1");
  });
});
