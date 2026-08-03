"use client";

import React, { useState } from "react";

export default function AdminDashboardPage() {
  // In full deployment, these are hydrated via TanStack Query from /api/admin/overview
  const [metrics] = useState({
    totalRevenue: 458900,
    totalOrders: 124,
    totalCustomers: 89,
    lowStockVariantsCount: 3,
  });

  const [lowStockAlerts] = useState([
    { id: "var_1", sku: "SKU-SERUM-50", stock: 2, product: { name: "Rose Hydration Serum", brand: "GlowMart" } },
    { id: "var_2", sku: "SKU-LIP-NUDE", stock: 1, product: { name: "Velvet Matte Lipstick", brand: "GlowMart" } },
    { id: "var_3", sku: "SKU-CLEANSE-100", stock: 4, product: { name: "Gentle Foaming Cleanser", brand: "GlowMart" } },
  ]);

  const [recentOrders] = useState([
    { id: "ord_101", customer: "Sara Khan", total: 4200, status: "DELIVERED", date: "2026-07-30" },
    { id: "ord_102", customer: "Ali Ahmed", total: 1850, status: "SHIPPED", date: "2026-07-30" },
    { id: "ord_103", customer: "Fatima Noor", total: 6100, status: "PENDING", date: "2026-07-29" },
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[var(--color-text-primary)]">Dashboard Overview</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Real-time overview of store sales, stock alerts, and customer activity.</p>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]">
          <p className="text-xs text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-bold text-[var(--color-accent-dark)] mt-2">Rs. {metrics.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]">
          <p className="text-xs text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">Total Orders</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">{metrics.totalOrders}</p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]">
          <p className="text-xs text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">Total Customers</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-2">{metrics.totalCustomers}</p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]">
          <p className="text-xs text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">Low Stock Items</p>
          <p className="text-2xl font-bold text-[var(--color-error)] mt-2">{metrics.lowStockVariantsCount}</p>
        </div>
      </div>

      {/* Grid: Low Stock Alerts + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alerts */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]">
          <h2 className="text-lg font-serif font-semibold text-[var(--color-text-primary)] mb-4">Low Stock Alerts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] uppercase">
                <tr>
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">SKU</th>
                  <th className="pb-3 font-medium text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {lowStockAlerts.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--color-primary-light)]/50 transition-colors">
                    <td className="py-3 font-medium text-[var(--color-text-primary)]">{item.product.name}</td>
                    <td className="py-3 text-[var(--color-text-secondary)]">{item.sku}</td>
                    <td className="py-3 text-right text-[var(--color-error)] font-bold">{item.stock} left</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-[var(--radius-md)] shadow-[var(--shadow-sm)]">
          <h2 className="text-lg font-serif font-semibold text-[var(--color-text-primary)] mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] uppercase">
                <tr>
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[var(--color-primary-light)]/50 transition-colors">
                    <td className="py-3 font-medium text-[var(--color-accent-dark)]">{ord.id}</td>
                    <td className="py-3 text-[var(--color-text-primary)]">{ord.customer}</td>
                    <td className="py-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium text-[var(--color-text-primary)]">Rs. {ord.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
