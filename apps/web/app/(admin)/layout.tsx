"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard Overview", icon: "📊" },
  { href: "/admin/products", label: "Products Catalog", icon: "📦" },
  { href: "/admin/orders", label: "Orders Management", icon: "🛍️" },
  { href: "/admin/coupons", label: "Promotions & Coupons", icon: "🏷️" },
  { href: "/admin/reviews", label: "Review Moderation", icon: "⭐" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-30">
        <span className="text-lg font-serif font-bold text-[var(--color-accent-dark)]">
          AISAF
          <span className="ml-2 text-xs bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] px-2 py-0.5 rounded-full font-medium">
            Admin
          </span>
        </span>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-light)] transition-colors text-[var(--color-text-primary)]"
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex flex-1 relative">
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/30 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed md:sticky top-0 md:top-0 h-screen md:h-auto
            w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)]
            p-6 flex flex-col justify-between shrink-0 z-20
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:flex
          `}
        >
          <div>
            {/* Brand - desktop only (hidden on mobile since we have top bar) */}
            <div className="hidden md:flex items-center gap-2 mb-8">
              <span className="text-2xl font-serif text-[var(--color-accent-dark)] font-bold">AISAF</span>
              <span className="text-xs bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] px-2 py-0.5 rounded-full font-medium">
                Admin
              </span>
            </div>

            <nav className="space-y-1 mt-8 md:mt-0">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || 
                  (link.href !== "/admin" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-[var(--radius-sm)] transition-colors ${
                      isActive
                        ? "bg-[var(--color-primary)] text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    <span className="text-base">{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-[var(--color-border)] space-y-3">
            <Link
              href="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent-dark)] transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Storefront
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
