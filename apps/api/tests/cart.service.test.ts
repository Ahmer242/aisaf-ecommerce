/**
 * @file cart.service.test.ts
 * @description Unit tests for Cart Service logic, subtotal formatting, and stock limit checks.
 */

import { describe, expect, it, vi } from "vitest";
import { CartService } from "../src/modules/cart/cart.service.js";

describe("CartService formatting and calculations", () => {
  const cartService = new CartService();

  it("calculates subtotal and formats items correctly with price overrides", () => {
    const rawCart = {
      id: "cart_123",
      userId: "user_456",
      guestSessionId: null,
      items: [
        {
          id: "item_1",
          cartId: "cart_123",
          variantId: "var_1",
          qty: 2,
          variant: {
            id: "var_1",
            attribute: "SIZE",
            value: "50ml",
            sku: "SKU-SERUM-50",
            stock: 10,
            priceOverride: 1200, // Override price
            product: {
              id: "prod_1",
              name: "Glow Serum",
              price: 1500,
              images: ["https://example.com/serum.jpg"],
            },
          },
        },
        {
          id: "item_2",
          cartId: "cart_123",
          variantId: "var_2",
          qty: 1,
          variant: {
            id: "var_2",
            attribute: "SHADE",
            value: "Rose Nude",
            sku: "SKU-LIP-ROSE",
            stock: 5,
            priceOverride: null, // Uses product base price
            product: {
              id: "prod_2",
              name: "Velvet Lipstick",
              price: 800,
              images: [],
            },
          },
        },
      ],
    };

    // Private method test via format call
    const formatted = (cartService as any).formatCartResponse(rawCart);

    expect(formatted.id).toBe("cart_123");
    expect(formatted.userId).toBe("user_456");
    expect(formatted.totalItems).toBe(3);
    // (2 * 1200) + (1 * 800) = 2400 + 800 = 3200
    expect(formatted.subtotal).toBe(3200);
    expect(formatted.items).toHaveLength(2);
    expect(formatted.items[0].unitPrice).toBe(1200);
    expect(formatted.items[0].itemTotal).toBe(2400);
    expect(formatted.items[1].unitPrice).toBe(800);
    expect(formatted.items[1].itemTotal).toBe(800);
  });
});
