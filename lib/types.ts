export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number; // for discount (USD base, formatted via FCFA)
  description: string;
  details: string[];
  images: string[];
  available: boolean;
  featured: boolean;
  rating?: number; // 0-5
  reviewCount?: number;
  discountPercent?: number;
  views?: number; // cumulative product views
  // enterprise audit + stock
  createdAt: string; // ISO
  createdBy: string; // user id / email
  updatedAt?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
  outOfStock: boolean;
  inventory: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

export interface NavLink {
  href: string;
  label: string;
}
