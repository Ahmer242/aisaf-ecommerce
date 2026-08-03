import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistItem = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  slug: string;
};

type WishlistState = {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find((i) => i.productId === item.productId);
        if (!existing) {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },
      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },
      clear: () => set({ items: [] }),
    }),
    { name: "aisaf-wishlist" },
  ),
);
