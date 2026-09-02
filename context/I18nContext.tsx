"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type Locale = "en" | "fr";

const translations = {
  en: {
    // Navigation
    "nav.products": "Products",
    "nav.about": "About",
    "nav.approach": "Approach",
    "nav.services": "Services",
    // Hero
    "hero.badge": "Premium Electronics & Goods",
    "hero.title1": "Goods that",
    "hero.title2": "mean something.",
    "hero.subtitle": "Premium electronics and lifestyle products — curated with intent, delivered with care.",
    "hero.cta": "Explore the collection",
    "hero.story": "Our story",
    "hero.products": "Products",
    "hero.customers": "Customers",
    "hero.rating": "Rating",
    // Products
    "products.title": "The Collection",
    "products.viewAll": "View all products",
    "products.search": "Search products...",
    "products.all": "All",
    "products.addToCart": "Add to Cart",
    "products.view": "View",
    "products.loading": "Loading...",
    // Product Detail
    "product.addToCart": "Add to Cart",
    "product.buyNow": "Buy Now",
    "product.details": "Details",
    // Cart
    "cart.title": "Cart",
    "cart.items": "items",
    "cart.item": "item",
    "cart.empty": "Your cart is empty",
    "cart.browse": "Browse products",
    "cart.subtotal": "Subtotal",
    "cart.shipping": "Shipping and taxes calculated at checkout.",
    "cart.checkout": "Proceed to Checkout",
    "cart.continue": "Continue Shopping",
    "cart.close": "Close cart",
    // Footer
    "footer.rights": "All rights reserved.",
    "footer.made": "Made with intent",
  },
  fr: {
    // Navigation
    "nav.products": "Produits",
    "nav.about": "A propos",
    "nav.approach": "Approche",
    "nav.services": "Services",
    // Hero
    "hero.badge": "Electronique et produits premium",
    "hero.title1": "Des produits",
    "hero.title2": "qui comptent.",
    "hero.subtitle": "Electronique premium et produits lifestyle — selectionnes avec soin, livres avec attention.",
    "hero.cta": "Explorer la collection",
    "hero.story": "Notre histoire",
    "hero.products": "Produits",
    "hero.customers": "Clients",
    "hero.rating": "Note",
    // Products
    "products.title": "La Collection",
    "products.viewAll": "Voir tous les produits",
    "products.search": "Rechercher...",
    "products.all": "Tous",
    "products.addToCart": "Ajouter au panier",
    "products.view": "Voir",
    "products.loading": "Chargement...",
    // Product Detail
    "product.addToCart": "Ajouter au panier",
    "product.buyNow": "Acheter",
    "product.details": "Details",
    // Cart
    "cart.title": "Panier",
    "cart.items": "articles",
    "cart.item": "article",
    "cart.empty": "Votre panier est vide",
    "cart.browse": "Parcourir les produits",
    "cart.subtotal": "Sous-total",
    "cart.shipping": "Frais de livraison et taxes calcules a la caisse.",
    "cart.checkout": "Passer a la caisse",
    "cart.continue": "Continuer les achats",
    "cart.close": "Fermer le panier",
    // Footer
    "footer.rights": "Tous droits reserves.",
    "footer.made": "Fait avec intention",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[locale][key] || key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
