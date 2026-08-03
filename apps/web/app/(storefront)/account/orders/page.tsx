"use client";

import Link from "next/link";
import { useState } from "react";

type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface MockOrder {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: { name: string; qty: number; price: number }[];
  paymentMethod: string;
}

const MOCK_ORDERS: MockOrder[] = [
  {
    id: "ORD-293847",
    date: "2026-07-30",
    total: 4200,
    status: "DELIVERED",
    items: [
      { name: "Rose Hydration Serum", qty: 1, price: 2450 },
      { name: "Velvet Matte Lipstick", qty: 1, price: 1250 },
    ],
    paymentMethod: "Stripe",
  },
  {
    id: "ORD-193726",
    date: "2026-07-25",
    total: 1800,
    status: "SHIPPED",
    items: [{ name: "Gentle Foaming Cleanser", qty: 1, price: 1800 }],
    paymentMethod: "JazzCash",
  },
  {
    id: "ORD-083615",
    date: "2026-07-20",
    total: 6100,
    status: "PENDING",
    items: [
      { name: "Rose Hydration Serum", qty: 2, price: 4900 },
      { name: "Velvet Matte Lipstick", qty: 1, price: 1200 },
    ],
    paymentMethod: "Easypaisa",
  },
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function AccountOrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-[length:var(--text-2xl)] text-text-primary">
            My Orders
          </h1>
          <p className="mt-2 text-text-secondary text-[length:var(--text-sm)]">
            Track your order status and view history.
          </p>
        </div>
        <Link
          href="/products"
          className="text-[length:var(--text-sm)] font-medium text-accent-dark hover:underline underline-offset-2"
        >
          Continue Shopping →
        </Link>
      </div>

      {MOCK_ORDERS.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-3xl">
            📦
          </div>
          <p className="text-text-secondary mb-6">No orders yet. Start shopping to see your orders here!</p>
          <Link
            href="/products"
            className="inline-block rounded-[var(--radius-md)] bg-accent px-8 py-3 font-medium text-text-inverse transition hover:bg-accent-dark"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {MOCK_ORDERS.map((order) => (
            <div
              key={order.id}
              className="rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-sm)] overflow-hidden transition hover:shadow-[var(--shadow-md)]"
            >
              {/* Order Header */}
              <button
                type="button"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="w-full text-left px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="font-medium text-[length:var(--text-sm)] text-accent-dark">
                    {order.id}
                  </span>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-[length:var(--text-sm)] text-text-secondary">
                  <span>{order.date}</span>
                  <span className="font-semibold text-text-primary">{formatPrice(order.total)}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Order Details (expandable) */}
              {expandedOrder === order.id && (
                <div className="border-t border-border px-4 sm:px-6 py-4 bg-primary-light/20 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[length:var(--text-xs)] uppercase tracking-wider text-text-secondary font-medium mb-2">
                        Order Items
                      </p>
                      <ul className="space-y-1.5">
                        {order.items.map((item, i) => (
                          <li key={i} className="flex items-center justify-between text-[length:var(--text-sm)]">
                            <span className="text-text-primary">
                              {item.name} <span className="text-text-secondary">× {item.qty}</span>
                            </span>
                            <span className="text-text-secondary font-medium">{formatPrice(item.price)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[length:var(--text-xs)] uppercase tracking-wider text-text-secondary font-medium mb-1">
                          Payment Method
                        </p>
                        <p className="text-[length:var(--text-sm)] text-text-primary">{order.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-[length:var(--text-xs)] uppercase tracking-wider text-text-secondary font-medium mb-1">
                          Total Paid
                        </p>
                        <p className="text-[length:var(--text-base)] font-semibold text-accent-dark">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="pt-2 border-t border-border">
                    <p className="text-[length:var(--text-xs)] uppercase tracking-wider text-text-secondary font-medium mb-3">
                      Order Progress
                    </p>
                    <div className="flex items-center gap-1">
                      {(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] as OrderStatus[]).map((step, i) => {
                        const steps: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
                        const currentIdx = steps.indexOf(order.status);
                        const stepIdx = i;
                        const isCompleted = stepIdx <= currentIdx && order.status !== "CANCELLED";
                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div
                              className={`h-2 w-2 rounded-full shrink-0 ${
                                isCompleted ? "bg-success" : "bg-border"
                              }`}
                            />
                            {i < 3 && (
                              <div
                                className={`flex-1 h-0.5 ${
                                  stepIdx < currentIdx && order.status !== "CANCELLED"
                                    ? "bg-success"
                                    : "bg-border"
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-1.5">
                      {["Placed", "Confirmed", "Shipped", "Delivered"].map((label) => (
                        <span key={label} className="text-[10px] text-text-secondary">{label}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
