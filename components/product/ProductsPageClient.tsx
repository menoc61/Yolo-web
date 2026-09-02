"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ProductCard } from "@/components/product/ProductGrid";
import { useProducts, useSearchProducts, useCategories } from "@/hooks/useProducts";
import { useI18n } from "@/context/I18nContext";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";

const FCFA_RATE = 620;

export default function ProductsPage() {
  const { t } = useI18n();
  const { data: allProducts, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [page, setPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const perPage = 6;
  const shouldReduce = useReducedMotion();
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: searchResults } = useSearchProducts(searchQuery, selectedCategory !== "All" ? selectedCategory : undefined);

  const minFCFA = minPrice.trim() ? Number(minPrice.replace(/\s/g, "")) : null;
  const maxFCFA = maxPrice.trim() ? Number(maxPrice.replace(/\s/g, "")) : null;

  const filtered = useMemo(() => {
    let base = searchQuery || selectedCategory !== "All" ? searchResults || [] : allProducts || [];
    if (minFCFA || maxFCFA) {
      base = base.filter((p) => {
        const fcfa = p.price * FCFA_RATE;
        if (minFCFA && fcfa < minFCFA) return false;
        if (maxFCFA && fcfa > maxFCFA) return false;
        return true;
      });
    }
    return base;
  }, [searchQuery, selectedCategory, searchResults, allProducts, minFCFA, maxFCFA]);

  const sorted = useMemo(() => {
    const items = [...filtered];
    switch (sortBy) {
      case "price-asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        items.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "newest":
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "popular":
        items.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
        break;
      default:
        break;
    }
    return items;
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const visibleProductCount = mounted ? sorted.length : 0;
  const visibleTotalPages = mounted ? totalPages : 1;
  const products = useMemo(() => {
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, page]);

  // reset page on filter change
  const handleSearch = (v: string) => { setSearchQuery(v); setPage(1); };
  const handleCategory = (c: string) => { setSelectedCategory(c); setPage(1); };
  const handleMinPrice = (v: string) => { setMinPrice(v); setPage(1); };
  const handleMaxPrice = (v: string) => { setMaxPrice(v); setPage(1); };

  // Ctrl/Cmd + S → focus the product search bar
  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        searchRef.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="page-content">
      <div className="container">
        <div className="products-section__label">Collection</div>
        <h1 className="page-title">{t("products.title")}</h1>

        {/* Search & Filter Bar */}
        <div className="products-filter">
          <div className="products-filter__search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              placeholder={t("products.search")}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="products-filter__input"
            />
            {searchQuery && (
              <motion.button
                className="products-filter__clear"
                onClick={() => handleSearch("")}
                aria-label="Clear search"
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            )}
          </div>

          <div className="products-filter__price" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 16, padding: "0 2px" }}>
            <span style={{ fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#666" }}>Prix FCFA</span>
            <input
              type="text"
              inputMode="numeric"
              aria-label="Prix minimum FCFA"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => handleMinPrice(e.target.value.replace(/[^\d\s]/g, ""))}
              className="products-filter__input"
              style={{ width: 84, flex: "0 0 auto", border: "1px solid #222", padding: "8px 10px" }}
            />
            <span style={{ color: "#444" }}>—</span>
            <input
              type="text"
              inputMode="numeric"
              aria-label="Prix maximum FCFA"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => handleMaxPrice(e.target.value.replace(/[^\d\s]/g, ""))}
              className="products-filter__input"
              style={{ width: 84, flex: "0 0 auto", border: "1px solid #222", padding: "8px 10px" }}
            />
            {(minFCFA || maxFCFA) && (
              <motion.button
                className="products-filter__clear"
                onClick={() => { handleMinPrice(""); handleMaxPrice(""); }}
                aria-label="Effacer le filtre de prix"
                whileTap={{ scale: 0.9 }}
                style={{ position: "static", width: "auto", padding: "6px 8px" }}
              >
                ✕
              </motion.button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div className="products-filter__sort">
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} aria-label="Trier par">
                <option value="default">Trier par</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="rating">Meilleures notes</option>
                <option value="newest">Plus récents</option>
                <option value="popular">Popularité</option>
              </select>
            </div>
          </div>

          <div className="products-filter__categories">
            <motion.button
              className={`products-filter__cat-btn${selectedCategory === "All" ? " is-active" : ""}`}
              onClick={() => handleCategory("All")}
              whileTap={{ scale: 0.97 }}
            >
              {t("products.all")}
            </motion.button>
            {mounted && categories?.map((cat) => (
              <motion.button
                key={cat}
                className={`products-filter__cat-btn${selectedCategory === cat ? " is-active" : ""}`}
                onClick={() => handleCategory(cat)}
                whileTap={{ scale: 0.97 }}
              >
                {cat}
              </motion.button>
            ))}
          </div>
          <div style={{ fontSize: "0.65rem", color: "#444", marginTop: 8, letterSpacing: "0.06em" }}>
            {visibleProductCount} produits · FCFA · Page {page}/{visibleTotalPages} · Avenue Kennedy · yolo.co
          </div>
        </div>

        {isLoading ? (
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="products-empty">
            <p>Aucun produit — essaye un autre filtre (FCFA).</p>
            <motion.button
              className="btn-secondary"
              onClick={() => { handleSearch(""); handleCategory("All"); handleMinPrice(""); handleMaxPrice(""); setSortBy("default"); }}
              whileTap={{ scale: 0.97 }}
            >
              Effacer filtres
            </motion.button>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedCategory}-${searchQuery}-${sortBy}-${page}`}
                initial={shouldReduce ? false : { opacity: 0, transform: "translateY(8px)" }}
                animate={{ opacity: 1, transform: "translateY(0px)" }}
                exit={{ opacity: 0, transform: "translateY(-8px)" }}
                transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
                className="product-grid"
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            </AnimatePresence>
            {/* Pagination with micro interaction */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
              <motion.button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="btn-secondary" style={{ opacity: page <= 1 ? 0.35 : 1, minWidth: 90 }} whileTap={{ scale: 0.97 }}>
                ← Précédent
              </motion.button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`products-filter__cat-btn ${page === i + 1 ? "is-active" : ""}`}
                  style={{ minWidth: 40 }}
                  whileTap={{ scale: 0.95 }}
                  animate={page === i + 1 && !shouldReduce ? { scale: [1, 1.06, 1] } : {}}
                  transition={{ duration: 0.25 }}
                >
                  {i + 1}
                </motion.button>
              ))}
              <motion.button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="btn-secondary" style={{ opacity: page >= totalPages ? 0.35 : 1, minWidth: 90 }} whileTap={{ scale: 0.97 }}>
                Suivant →
              </motion.button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
