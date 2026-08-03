import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartLine = { variantId: string; qty: number };

type CartState = {
  items: CartLine[];
  addItem: (line: CartLine) => void;
  removeItem: (variantId: string) => void;
  updateQty: (variantId: string, qty: number) => void;
  clear: () => void;
  totalItems: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (line) => {
        const existing = get().items.find((i) => i.variantId === line.variantId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === line.variantId
                ? { ...i, qty: Math.max(1, Math.min(99, i.qty + line.qty)) }
                : i,
            ),
          });
          return;
        }
        set({ items: [...get().items, { ...line, qty: Math.max(1, line.qty) }] });
      },
      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },
      updateQty: (variantId, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.variantId !== variantId) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, qty: Math.min(99, qty) } : i,
          ),
        });
      },
      clear: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: "aisaf-cart" },
  ),
);
