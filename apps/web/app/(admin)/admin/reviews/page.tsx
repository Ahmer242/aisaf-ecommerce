"use client";

import React, { useState } from "react";

interface ReviewRow {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [filterTab, setFilterTab] = useState<"ALL" | "PENDING" | "APPROVED">("PENDING");

  const [reviews, setReviews] = useState<ReviewRow[]>([
    {
      id: "r1",
      productName: "Rose Hydration Serum",
      customerName: "Sara K.",
      rating: 5,
      comment: "Absolutely in love with this serum! My skin feels so soft and glowing after just a week.",
      isVerifiedPurchase: true,
      isApproved: false,
      createdAt: "2026-07-30",
    },
    {
      id: "r2",
      productName: "Velvet Matte Lipstick",
      customerName: "Hira M.",
      rating: 4,
      comment: "Great shade and formula, doesn't dry out lips. Lasts about 6 hours.",
      isVerifiedPurchase: true,
      isApproved: true,
      createdAt: "2026-07-29",
    },
    {
      id: "r3",
      productName: "Gentle Foaming Cleanser",
      customerName: "Amna B.",
      rating: 5,
      comment: "Very gentle on sensitive skin. Cleans thoroughly without stripping moisture.",
      isVerifiedPurchase: false,
      isApproved: false,
      createdAt: "2026-07-28",
    },
  ]);

  const toggleApproval = (id: string, approve: boolean) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isApproved: approve } : r))
    );
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterTab === "PENDING") return !r.isApproved;
    if (filterTab === "APPROVED") return r.isApproved;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[var(--color-text-primary)]">Review Moderation</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Approve or reject customer product reviews before they appear publicly on storefront product pages.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] pb-3">
        {(["PENDING", "APPROVED", "ALL"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-colors ${
              filterTab === tab
                ? "bg-[var(--color-accent-dark)] text-white"
                : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {tab === "PENDING" ? "Pending Moderation" : tab === "APPROVED" ? "Approved" : "All Reviews"}
          </button>
        ))}
      </div>

      {/* Reviews - Card Layout on mobile, Table on desktop */}
      <div className="hidden md:block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-primary-light)]/50 border-b border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] uppercase">
              <tr>
                <th className="px-6 py-3.5 font-medium">Product</th>
                <th className="px-6 py-3.5 font-medium">Customer</th>
                <th className="px-6 py-3.5 font-medium">Rating</th>
                <th className="px-6 py-3.5 font-medium">Comment</th>
                <th className="px-6 py-3.5 font-medium">Verified</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-xs text-[var(--color-text-secondary)]">
                    No reviews matching current filter.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-[var(--color-primary-light)]/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-[var(--color-text-primary)]">{rev.productName}</td>
                    <td className="px-6 py-4 text-[var(--color-text-secondary)]">{rev.customerName}</td>
                    <td className="px-6 py-4 text-[var(--color-star)] font-bold">
                      {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                    </td>
                    <td className="px-6 py-4 max-w-xs text-xs text-[var(--color-text-primary)] truncate">
                      &ldquo;{rev.comment}&rdquo;
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          rev.isVerifiedPurchase
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {rev.isVerifiedPurchase ? "Verified Buyer" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          rev.isApproved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {rev.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      {rev.isApproved ? (
                        <button
                          onClick={() => toggleApproval(rev.id, false)}
                          className="text-xs text-[var(--color-error)] hover:underline font-medium"
                        >
                          Reject
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleApproval(rev.id, true)}
                          className="text-xs text-green-700 hover:underline font-semibold"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => deleteReview(rev.id)}
                        className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-error)] hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-10 text-sm text-[var(--color-text-secondary)]">
            No reviews matching current filter.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-sm)] space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)] text-sm">{rev.productName}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{rev.customerName} · {rev.createdAt}</p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                    rev.isApproved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {rev.isApproved ? "Approved" : "Pending"}
                </span>
              </div>
              <p className="text-[var(--color-star)] text-sm">
                {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
              </p>
              <p className="text-xs text-[var(--color-text-primary)] italic">&ldquo;{rev.comment}&rdquo;</p>
              {rev.isVerifiedPurchase && (
                <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-purple-100 text-purple-800 inline-block">
                  Verified Buyer
                </span>
              )}
              <div className="flex items-center gap-4 pt-1">
                {rev.isApproved ? (
                  <button
                    onClick={() => toggleApproval(rev.id, false)}
                    className="text-xs text-[var(--color-error)] hover:underline font-medium"
                  >
                    Reject
                  </button>
                ) : (
                  <button
                    onClick={() => toggleApproval(rev.id, true)}
                    className="text-xs text-green-700 hover:underline font-semibold"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={() => deleteReview(rev.id)}
                  className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-error)] hover:underline font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
