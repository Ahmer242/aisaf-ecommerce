"use client";

import { useCartStore } from "@/store/cart";

export function AddToCartButton({
  variantId,
  disabled,
}: {
  variantId?: string;
  disabled?: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <button
      type="button"
      disabled={disabled || !variantId}
      onClick={() => {
        if (!variantId) return;
        addItem({ variantId, qty: 1 });
      }}
      className="rounded-[var(--radius-md)] bg-accent px-6 py-3 font-medium text-text-inverse shadow-[var(--shadow-sm)] transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
    >
      Add to cart
    </button>
  );
}
