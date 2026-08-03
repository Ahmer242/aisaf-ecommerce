"use client";

import Link from "next/link";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import type { Metadata } from "next";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function WishlistPage() {
  const { items, removeItem, clear } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);

  const handleMoveToCart = (productId: string) => {
    // Use productId as a stand-in variantId for demo purposes
    addToCart({ variantId: productId, qty: 1 });
    removeItem(productId);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-[length:var(--text-2xl)] text-text-primary">
            Your Wishlist
          </h1>
          <p className="mt-2 text-text-secondary text-[length:var(--text-sm)]">
            {items.length === 0
              ? "Save products you love and come back to shop later."
              : `${items.length} item${items.length > 1 ? "s" : ""} saved for later`}
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-[length:var(--text-xs)] text-error hover:underline"
          >
            Clear wishlist
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-12 sm:p-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-3xl">
            ♡
          </div>
          <p className="text-text-secondary mb-6 text-[length:var(--text-base)]">
            Your wishlist is empty. Browse our catalog to find products you love!
          </p>
          <Link
            href="/products"
            className="inline-block rounded-[var(--radius-md)] bg-accent px-8 py-3 font-medium text-text-inverse transition hover:bg-accent-dark"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.productId}
              className="group relative rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition overflow-hidden"
            >
              {/* Image placeholder */}
              <Link href={`/products/${item.slug}`}>
                <div className="relative aspect-[4/5] bg-gradient-to-br from-primary-light to-primary overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl text-primary-dark/40">
                      🌸
                    </div>
                  )}
                </div>
              </Link>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeItem(item.productId)}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-error shadow-[var(--shadow-sm)] transition hover:bg-error hover:text-white"
                aria-label="Remove from wishlist"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-4 space-y-3">
                <Link href={`/products/${item.slug}`}>
                  <h3 className="text-[length:var(--text-base)] font-medium text-text-primary hover:text-accent-dark transition">
                    {item.name}
                  </h3>
                </Link>
                <p className="font-semibold text-accent-dark">{formatPrice(item.price)}</p>
                <button
                  type="button"
                  onClick={() => handleMoveToCart(item.productId)}
                  className="w-full rounded-[var(--radius-md)] border border-accent bg-accent/10 px-4 py-2.5 text-[length:var(--text-sm)] font-medium text-accent-dark transition hover:bg-accent hover:text-text-inverse"
                >
                  Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
