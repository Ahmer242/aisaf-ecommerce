"use client";

import React, { useState } from "react";

interface CouponRow {
  id: string;
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrderValue: number | null;
  usedCount: number;
  usageLimit: number | null;
  firstOrderOnly: boolean;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRow[]>([
    { id: "c1", code: "GLOW20", type: "PERCENT", value: 20, minOrderValue: 2000, usedCount: 45, usageLimit: 100, firstOrderOnly: false, isActive: true },
    { id: "c2", code: "WELCOME100", type: "FLAT", value: 100, minOrderValue: 1000, usedCount: 89, usageLimit: null, firstOrderOnly: true, isActive: true },
    { id: "c3", code: "SUMMER500", type: "FLAT", value: 500, minOrderValue: 5000, usedCount: 10, usageLimit: 50, firstOrderOnly: false, isActive: false },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "PERCENT",
    value: "",
    minOrderValue: "",
    firstOrderOnly: false,
  });

  const toggleCouponStatus = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.value) return;

    const created: CouponRow = {
      id: `c_${Date.now()}`,
      code: newCoupon.code.toUpperCase(),
      type: newCoupon.type as "PERCENT" | "FLAT",
      value: Number(newCoupon.value),
      minOrderValue: newCoupon.minOrderValue ? Number(newCoupon.minOrderValue) : null,
      usedCount: 0,
      usageLimit: null,
      firstOrderOnly: newCoupon.firstOrderOnly,
      isActive: true,
    };

    setCoupons([created, ...coupons]);
    setNewCoupon({ code: "", type: "PERCENT", value: "", minOrderValue: "", firstOrderOnly: false });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[var(--color-text-primary)]">Promotions & Coupons</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Create and manage discount codes, usage limits, and first-order rules.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[var(--color-accent-dark)] hover:bg-[var(--color-accent)] text-white text-sm font-medium px-5 py-2.5 rounded-[var(--radius-md)] transition-colors self-start sm:self-auto"
        >
          + Create New Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-primary-light)]/50 border-b border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] uppercase">
              <tr>
                <th className="px-6 py-3.5 font-medium">Coupon Code</th>
                <th className="px-6 py-3.5 font-medium">Discount Type</th>
                <th className="px-6 py-3.5 font-medium">Value</th>
                <th className="px-6 py-3.5 font-medium">Min Order</th>
                <th className="px-6 py-3.5 font-medium">Usage Count</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--color-primary-light)]/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-[var(--color-accent-dark)]">{c.code}</td>
                  <td className="px-6 py-4 text-xs font-medium text-[var(--color-text-secondary)]">{c.type}</td>
                  <td className="px-6 py-4 font-semibold text-[var(--color-text-primary)]">
                    {c.type === "PERCENT" ? `${c.value}%` : `Rs. ${c.value}`}
                  </td>
                  <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                    {c.minOrderValue ? `Rs. ${c.minOrderValue}` : "None"}
                  </td>
                  <td className="px-6 py-4 text-[var(--color-text-primary)]">
                    {c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : ""}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        c.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.isActive ? "Active" : "Expired/Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleCouponStatus(c.id)}
                      className="text-xs text-[var(--color-accent-dark)] hover:underline font-medium"
                    >
                      {c.isActive ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 max-w-md w-full shadow-[var(--shadow-lg)] space-y-4">
            <h2 className="text-xl font-serif font-bold text-[var(--color-text-primary)]">Create Promotional Coupon</h2>
            <form onSubmit={handleCreateCoupon} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-2.5 uppercase font-mono focus:outline-none focus:border-[var(--color-accent)]"
                  placeholder="e.g. FLASH30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Type</label>
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                    className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-2.5 focus:outline-none focus:border-[var(--color-accent)]"
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                    className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-2.5 focus:outline-none focus:border-[var(--color-accent)]"
                    placeholder="20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Min Order Subtotal (Rs.)</label>
                <input
                  type="number"
                  value={newCoupon.minOrderValue}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })}
                  className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] p-2.5 focus:outline-none focus:border-[var(--color-accent)]"
                  placeholder="1500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="firstOrderOnly"
                  checked={newCoupon.firstOrderOnly}
                  onChange={(e) => setNewCoupon({ ...newCoupon, firstOrderOnly: e.target.checked })}
                  className="rounded border-[var(--color-border)] text-[var(--color-accent-dark)] focus:ring-0"
                />
                <label htmlFor="firstOrderOnly" className="text-xs text-[var(--color-text-primary)]">
                  Restrict to customer's first order only
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[var(--color-accent-dark)] text-white px-4 py-2 rounded-[var(--radius-sm)] text-xs font-medium hover:bg-[var(--color-accent)] transition-colors"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
