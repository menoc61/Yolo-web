import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistItem {
  productId: string;
  addedAt: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  count: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId: string) => {
        set((state) => ({
          items: [...state.items, { productId, addedAt: new Date().toISOString() }],
        }));
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      toggleItem: (productId: string) => {
        const { isInWishlist } = get();
        if (isInWishlist(productId)) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.productId === productId);
      },

      count: () => {
        return get().items.length;
      },
    }),
    { name: "yolo-wishlist" }
  )
);