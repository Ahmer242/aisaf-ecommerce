"use client";

/**
 * @file app/(storefront)/cart/page.tsx
 * @description Customer Shopping Cart page — uses Zustand cart store with
 * proper remove, quantity update, coupon input, and responsive layout.
 */

import React, { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(price);
}

/** Mock price for demo — in production this fetches from the API */
const MOCK_UNIT_PRICE = 1200;

export default function CartPage() {
  const { items, updateQty, removeItem, clear } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<string | null>(null);

  const subtotal = items.reduce((acc, item) => acc + item.qty * MOCK_UNIT_PRICE, 0);
  const shipping = subtotal >= 3000 || subtotal === 0 ? 0 : 250;
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponApplied(couponCode.trim().toUpperCase());
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-heading)] text-[length:var(--text-2xl)] text-text-primary mb-2">
        Your Shopping Bag
      </h1>
      <p className="text-text-secondary text-[length:var(--text-sm)] mb-8">
        {items.length === 0
          ? "Your bag is empty."
          : `${items.reduce((s, i) => s + i.qty, 0)} item${items.length > 1 ? "s" : ""} in your bag`}
      </p>

      {items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-12 sm:p-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-3xl">
            🛍️
          </div>
          <p className="text-text-secondary mb-6 text-[length:var(--text-base)]">
            Your shopping bag is currently empty.
          </p>
          <Link
            href="/products"
            className="inline-block rounded-[var(--radius-md)] bg-accent px-8 py-3 font-medium text-text-inverse transition hover:bg-accent-dark"
          >
            Explore Cosmetics
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="rounded-[var(--radius-md)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex items-start gap-4">
                  {/* Image placeholder */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-light rounded-[var(--radius-sm)] flex items-center justify-center text-primary-dark font-semibold text-xs shrink-0">
                    AISAF
                  </div>

                  {/* Item details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-[length:var(--text-sm)] sm:text-[length:var(--text-base)] font-medium text-text-primary">
                          Cosmetics Variant #{item.variantId.slice(-4)}
                        </h3>
                        <p className="text-[length:var(--text-xs)] text-text-secondary mt-0.5">
                          {formatPrice(MOCK_UNIT_PRICE)} each
                        </p>
                      </div>
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="p-1.5 rounded-[var(--radius-sm)] text-text-secondary hover:text-error hover:bg-error/10 transition shrink-0"
                        aria-label="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Quantity + Line total */}
                    <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center border border-border rounded-[var(--radius-sm)] px-1">
                        <button
                          type="button"
                          onClick={() => updateQty(item.variantId, item.qty - 1)}
                          className="px-2.5 py-1.5 text-text-secondary hover:text-text-primary font-bold text-sm transition"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-3 py-1.5 text-text-primary font-medium text-sm min-w-[2rem] text-center">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.variantId, item.qty + 1)}
                          className="px-2.5 py-1.5 text-text-secondary hover:text-text-primary font-bold text-sm transition"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-semibold text-accent-dark text-[length:var(--text-sm)]">
                        {formatPrice(item.qty * MOCK_UNIT_PRICE)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Actions row */}
            <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
              <button
                type="button"
                onClick={clear}
                className="text-[length:var(--text-xs)] text-error hover:underline underline-offset-2"
              >
                Clear entire bag
              </button>
              <Link
                href="/products"
                className="text-[length:var(--text-xs)] text-text-secondary hover:underline underline-offset-2"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary & Coupon Card */}
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] h-fit space-y-6">
            <h2 className="font-[family-name:var(--font-heading)] text-[length:var(--text-lg)] text-text-primary">
              Order Summary
            </h2>

            {/* Coupon Form */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-[length:var(--text-xs)] text-text-secondary block font-medium">
                Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2 text-[length:var(--text-sm)] text-text-primary outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  className="rounded-[var(--radius-sm)] bg-primary-light px-4 py-2 text-[length:var(--text-xs)] font-semibold text-primary-dark transition hover:bg-primary hover:text-text-primary"
                >
                  Apply
                </button>
              </div>
              {couponApplied && (
                <p className="text-[length:var(--text-xs)] text-success font-medium">
                  Coupon &ldquo;{couponApplied}&rdquo; applied (−10%)
                </p>
              )}
            </form>

            <div className="border-t border-border pt-4 space-y-3 text-[length:var(--text-sm)]">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>− {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-text-secondary">
                <span>Estimated Shipping</span>
                <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold text-[length:var(--text-lg)] text-text-primary">
                <span>Total</span>
                <span className="text-accent-dark">{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full text-center rounded-[var(--radius-md)] bg-accent py-3 font-medium text-text-inverse shadow-[var(--shadow-sm)] transition hover:bg-accent-dark hover:shadow-[var(--shadow-md)]"
            >
              Proceed to Checkout
            </Link>

            <p className="text-[length:var(--text-xs)] text-text-secondary text-center">
              🔒 Secure 256-bit SSL encrypted checkout
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
