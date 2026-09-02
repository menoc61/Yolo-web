import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface YoloOrder {
  id: string;
  date: string;
  totalFCFA: number;
  payment: "visa" | "om" | "momo" | "cash";
  shipping: string;
  status: "paid" | "pending_push" | "cod_pending" | "delivered";
  items: { id: string; name: string; qty: number; image: string }[];
}

export interface YoloReview {
  id: string;
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
}

interface OrdersStore {
  orders: YoloOrder[];
  reviews: YoloReview[];
  addOrder: (o: YoloOrder) => void;
  addReview: (r: YoloReview) => void;
  clearHistory: () => void;
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set) => ({
      orders: [
        {
          id: "YOLO-8F3A9",
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          totalFCFA: 55180,
          payment: "momo",
          shipping: "Yaoundé",
          status: "delivered",
          items: [{ id: "p4", name: "Wireless Headphones Pro", qty: 1, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80" }],
        },
        {
          id: "YOLO-2B7C1",
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
          totalFCFA: 73160,
          payment: "visa",
          shipping: "Cameroun",
          status: "paid",
          items: [{ id: "p5", name: "Smartwatch Titanium", qty: 1, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80" }],
        },
      ],
      reviews: [
        { id: "rv1", productId: "p4", productName: "Wireless Headphones Pro", rating: 5, comment: "Son incroyable, livraison Avenue Kennedy ultra rapide !", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
        { id: "rv2", productId: "p1", productName: "Bold Crewneck", rating: 4, comment: "Qualité top, taille parfaite.", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
      ],
      addOrder: (o) => set((s) => ({ orders: [o, ...s.orders] })),
      addReview: (r) => set((s) => ({ reviews: [r, ...s.reviews] })),
      clearHistory: () => set({ orders: [], reviews: [] }),
    }),
    { name: "yolo-orders" }
  )
);
