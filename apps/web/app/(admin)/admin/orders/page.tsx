"use client";

import React, { useState } from "react";

type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface OrderRow {
  id: string;
  customerName: string;
  paymentMethod: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-amber-100 text-amber-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const [orders, setOrders] = useState<OrderRow[]>([
    { id: "ord_201", customerName: "Ayesha Malik", paymentMethod: "STRIPE", totalAmount: 4200, status: "DELIVERED", createdAt: "2026-07-30" },
    { id: "ord_202", customerName: "Zainab Tariq", paymentMethod: "JAZZCASH", totalAmount: 1850, status: "SHIPPED", createdAt: "2026-07-30" },
    { id: "ord_203", customerName: "Usman Ali", paymentMethod: "EASYPAISA", totalAmount: 6100, status: "PENDING", createdAt: "2026-07-29" },
    { id: "ord_204", customerName: "Hamza Khan", paymentMethod: "STRIPE", totalAmount: 3200, status: "CONFIRMED", createdAt: "2026-07-29" },
  ]);

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const filteredOrders = filterStatus === "ALL"
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-text-primary)]">Orders Management</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Review customer orders, update shipping statuses, and track fulfillment.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] pb-3 overflow-x-auto">
        {["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
              filterStatus === st
                ? "bg-[var(--color-accent-dark)] text-white"
                : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-primary-light)]/50 border-b border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] uppercase">
              <tr>
                <th className="px-6 py-3.5 font-medium">Order Reference</th>
                <th className="px-6 py-3.5 font-medium">Customer Name</th>
                <th className="px-6 py-3.5 font-medium">Payment Method</th>
                <th className="px-6 py-3.5 font-medium">Total Amount</th>
                <th className="px-6 py-3.5 font-medium">Fulfillment Status</th>
                <th className="px-6 py-3.5 font-medium text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[var(--color-primary-light)]/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-[var(--color-accent-dark)]">{ord.id}</td>
                  <td className="px-6 py-4 font-medium text-[var(--color-text-primary)]">{ord.customerName}</td>
                  <td className="px-6 py-4 text-xs font-medium text-[var(--color-text-secondary)]">{ord.paymentMethod}</td>
                  <td className="px-6 py-4 font-bold text-[var(--color-text-primary)]">Rs. {ord.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[ord.status]}`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={ord.status}
                      onChange={(e) => updateStatus(ord.id, e.target.value as OrderStatus)}
                      className="text-xs border border-[var(--color-border)] rounded-[var(--radius-sm)] p-1.5 bg-white text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-10 text-sm text-[var(--color-text-secondary)]">
            No orders matching current filter.
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-sm)] space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--color-accent-dark)] text-sm">{ord.id}</p>
                  <p className="font-medium text-[var(--color-text-primary)] text-sm mt-0.5">{ord.customerName}</p>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_STYLES[ord.status]}`}>
                  {ord.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                <span>{ord.paymentMethod}</span>
                <span>{ord.createdAt}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                <span className="font-bold text-[var(--color-text-primary)]">Rs. {ord.totalAmount.toLocaleString()}</span>
                <select
                  value={ord.status}
                  onChange={(e) => updateStatus(ord.id, e.target.value as OrderStatus)}
                  className="text-xs border border-[var(--color-border)] rounded-[var(--radius-sm)] p-1.5 bg-white text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
