"use client";

/**
 * @file app/(storefront)/checkout/page.tsx
 * @description Checkout flow — Shipping Address, Payment Method selection
 * (Stripe / JazzCash / Easypaisa), order submission and confirmation.
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

const MOCK_UNIT_PRICE = 1200;

export default function CheckoutPage() {
  const { items, clear } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("Lahore");
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "JAZZCASH" | "EASYPAISA">("STRIPE");

  const subtotal = items.reduce((acc, item) => acc + item.qty * MOCK_UNIT_PRICE, 0);
  const shipping = subtotal >= 3000 || subtotal === 0 ? 0 : 250;
  const total = subtotal + shipping;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 1200));
      const simulatedOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      clear();
      setOrderPlaced(simulatedOrderId);
    } catch (err) {
      console.error("Checkout failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/20 text-success text-3xl">
          ✓
        </div>
        <h1 className="font-[family-name:var(--font-heading)] text-[length:var(--text-2xl)] text-text-primary">
          Order Confirmed!
        </h1>
        <p className="text-text-secondary">
          Thank you for shopping with AISAF. Your order number is{" "}
          <strong className="text-text-primary">{orderPlaced}</strong>.
        </p>
        <p className="text-[length:var(--text-sm)] text-text-secondary">
          We have sent a confirmation email with order details and tracking updates.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/account/orders"
            className="rounded-[var(--radius-md)] border border-border bg-surface px-6 py-3 font-medium text-text-primary transition hover:bg-primary-light text-[length:var(--text-sm)]"
          >
            View My Orders
          </Link>
          <Link
            href="/products"
            className="rounded-[var(--radius-md)] bg-accent px-6 py-3 font-medium text-text-inverse transition hover:bg-accent-dark text-[length:var(--text-sm)]"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-[family-name:var(--font-heading)] text-[length:var(--text-2xl)] text-text-primary mb-8">
        Checkout
      </h1>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Shipping & Payment */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 space-y-4">
            <h2 className="font-[family-name:var(--font-heading)] text-[length:var(--text-lg)] text-text-primary">
              1. Shipping Address
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[length:var(--text-xs)] text-text-secondary font-medium block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ayesha Khan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2.5 text-[length:var(--text-sm)] text-text-primary outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-[length:var(--text-xs)] text-text-secondary font-medium block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0300-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2.5 text-[length:var(--text-sm)] text-text-primary outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="text-[length:var(--text-xs)] text-text-secondary font-medium block mb-1">
                Street Address
              </label>
              <input
                type="text"
                required
                placeholder="House #, Street, Block, Area"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                className="w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2.5 text-[length:var(--text-sm)] text-text-primary outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[length:var(--text-xs)] text-text-secondary font-medium block mb-1">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 py-2.5 text-[length:var(--text-sm)] text-text-primary outline-none focus:border-accent"
                >
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                </select>
              </div>
              <div>
                <label className="text-[length:var(--text-xs)] text-text-secondary font-medium block mb-1">
                  Country
                </label>
                <input
                  type="text"
                  disabled
                  value="Pakistan"
                  className="w-full rounded-[var(--radius-sm)] border border-border bg-primary-light/30 px-3 py-2.5 text-[length:var(--text-sm)] text-text-secondary cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 space-y-4">
            <h2 className="font-[family-name:var(--font-heading)] text-[length:var(--text-lg)] text-text-primary">
              2. Payment Method
            </h2>

            <div className="space-y-3">
              {([
                {
                  id: "STRIPE" as const,
                  title: "Credit / Debit Card (Stripe)",
                  subtitle: "Visa, MasterCard, UnionPay",
                  badge: "International",
                  badgeStyle: "bg-primary-light text-primary-dark",
                },
                {
                  id: "JAZZCASH" as const,
                  title: "JazzCash Mobile Wallet",
                  subtitle: "Pay via JazzCash app / mobile account",
                  badge: "Local PK",
                  badgeStyle: "bg-surface border border-border text-text-secondary",
                },
                {
                  id: "EASYPAISA" as const,
                  title: "Easypaisa Mobile Wallet",
                  subtitle: "Pay via Easypaisa app / account",
                  badge: "Local PK",
                  badgeStyle: "bg-surface border border-border text-text-secondary",
                },
              ]).map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center justify-between p-4 rounded-[var(--radius-md)] border cursor-pointer transition ${
                    paymentMethod === method.id
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="accent-[var(--color-accent)]"
                    />
                    <div>
                      <span className="font-medium text-[length:var(--text-sm)] text-text-primary block">
                        {method.title}
                      </span>
                      <span className="text-[length:var(--text-xs)] text-text-secondary">{method.subtitle}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded font-medium shrink-0 ${method.badgeStyle}`}>
                    {method.badge}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] h-fit space-y-6">
          <h2 className="font-[family-name:var(--font-heading)] text-[length:var(--text-lg)] text-text-primary">
            Order Summary
          </h2>

          <div className="space-y-3 text-[length:var(--text-sm)]">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal ({items.reduce((a, b) => a + b.qty, 0)} items)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Shipping Fee</span>
              <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-semibold text-[length:var(--text-lg)] text-text-primary">
              <span>Total Payable</span>
              <span className="text-accent-dark">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="w-full rounded-[var(--radius-md)] bg-accent py-3 font-medium text-text-inverse shadow-[var(--shadow-sm)] transition hover:bg-accent-dark hover:shadow-[var(--shadow-md)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing Order…" : `Place Order (${formatPrice(total)})`}
          </button>

          <p className="text-[length:var(--text-xs)] text-text-secondary text-center">
            🔒 Safe & Secure 256-Bit SSL Encrypted Checkout
          </p>
        </div>
      </form>
    </main>
  );
}
