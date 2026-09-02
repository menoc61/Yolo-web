# YOLO — yolo.co · Avenue Kennedy, Yaoundé

Enterprise e-commerce for Cameroun — prices in **FCFA**, hosted on **yolo.co**, flagship store **Avenue Kennedy, Yaoundé**. Mobile-first, 60fps, accessible, SEO-perfect. Built for scale.

## Stack

| Layer | Tech | Why |
|-------|------|-----|
| Framework | Next.js 16 App Router, Turbopack, `use cache` | RSC, streaming, `cacheComponents` ready |
| UI | React 19, TypeScript strict, `motion` (framer) + GSAP 3 + ScrollTrigger + Lenis | GPU-only `transform`/`opacity`, `@starting-style` fallbacks |
| State | Zustand `yolo-cart` (persist, versioned) + TanStack Query 5 (dedup, `useCache` server) | Vercel best-practice: parallel fetch, `Promise.all`, no waterfalls |
| Styling | CSS BEM + Tailwind 4 (`tw-animate-css`), design tokens (`--ease-out`) | Scalable, no CSS-in-JS runtime |
| Data | `data/products.json` external + `lib/products.ts` / `lib/products.server.ts` | Dummy data isolated, `use cache` server |
| Payments | Visa, Orange Money, MTN MoMo, Cash on Delivery + promo codes | FCFA throughout |
| Hosting | yolo.co, `metadataBase` `https://yolo.co`, OG `fr_CM`, `y+` |

## Architecture — scalable, maintainable

```
web/
├─ app/                 // RSC pages, generateStaticParams, use cache, page transitions
│  ├─ (marketing)/page.tsx  // Hero, Featured, GSAP batch reveal
│  ├─ products/[slug]/  // AnimatedCarousel 4 images, Rating, FCFA
│  ├─ products/page.tsx // Filters + pagination + AnimatePresence, Skeleton
│  ├─ contact/page.tsx  // Animated inputs, validation
│  ├─ checkout/page.tsx // Visa/OM/MoMo/COD + shipping
│  └─ layout.tsx        // fonts (Josefin), Query+ I18n, SiteHeader, PageTransition, Newsletter, SiteFooter, viewport
├─ components/
│  ├─ ui/AnimatedCarousel.tsx // motion, blur placeholder, progress, drag, reduced-motion, avif/webp
│  ├─ ui/Skeleton.tsx, ui/AnimatedInput.tsx
│  ├─ cms/PageTransition.tsx, cms/Newsletter.tsx (WhatsApp)
│  ├─ product/ProductRating.tsx, ProductGrid.tsx
│  ├─ cart/CartDrawer.tsx  // FCFA, promo, spinner micro-interaction
│  └─ cms/ContactForm.tsx // micro-interaction validated
├─ data/products.json   // external dummy data (12 products, 4 images, rating, discount, audit)
├─ lib/
│  ├─ types.ts         // Product { rating, reviewCount, discountPercent, createdAt, createdBy, deletedAt, deletedBy, outOfStock, inventory }
│  ├─ currency.ts      // formatFCFA (fr-CM), formatPrice USD→FCFA 620
│  ├─ promo.ts         // YOLO10, KENNEDY20, WHATSAPP5
│  └─ products{,.server}.ts // client + "use cache" server
├─ hooks/useAnimations.ts // gsap context, ScrollTrigger batch, 60fps
└─ stores/cart.ts       // persist, itemCount/subtotal
```

**Principles:**
- **Mobile-first**: `viewport` `device-width`, `640/1024` breakpoints, `dvh`, touch `44px` targets, hover gated `(@media hover:hover)`, `useReducedMotion` everywhere.
- **Performance**: `next/image` `fill`+`sizes`+`blurDataURL`+`fetchPriority high` for LCP, `formats avif/webp`, `minimumCacheTTL 30d`, `content-visibility` on grids, `Promise.all` parallel, `React.cache` dedup, `motion` layout springs `500/40`.
- **SEO**: `metadata` + `viewport` + `openGraph fr_CM` + `canonical yolo.co` + `generateStaticParams` + JSON-LD (Product) planned.
- **A11y**: `prefers-reduced-motion` fallbacks, `focus-visible:ring`, `aria-*`, keyboard Nav (Esc, arrows).
- **Maintainability**: One source `data/` , typed `Product`, `formatFCFA` single, `promo` single, `AGENTS.md` rules, `README` as contract.

## Animations — iart-ai/web-animation-skills + micro-interaction + 60fps

All skills installed: `animate`, `gsap-core/scrolltrigger/timeline/react/performance`, `iart-ai` 60fps, micro-interaction, page-transition, accessible, gsap-web.

- **Micro**: buttons `whileTap scale 0.96` spring `400/30`, `whileHover 1.03`, inputs focus `boxShadow 0 0 0 3px`, toast `AnimatePresence mode=popLayout`, `duration 100–250ms`, `ease [0.16,1,0.3,1]` / `var(--ease-out)`.
- **Page transition**: `PageTransition` GSAP `fromTo opacity 0→1 y 8→0 0.45s power3.out` on `pathname` change, `will-change-transform`.
- **Carousel**: transform/opacity only, stagger `0.06`, drag `0.14`, progress `scaleX linear`.
- **Background micro**: `Newsletter` shimmer, `Hero` Lenis smooth, `pulse-dot` 2s.

## Data model — audit + stock

`Product` now:
```ts
{ id, slug, name, category, price, originalPrice?, discountPercent?, rating, reviewCount, images[4], available, featured, createdAt, createdBy, updatedAt, deletedAt?, deletedBy?, outOfStock, inventory }
```
Stored in `data/products.json`, loaded via `lib/products.ts` (client) and `products.server.ts` (`"use cache"`).

## Getting started

```bash
bun install
bun run dev      # http://localhost:3000
bun run build    # typecheck + turbopack
```

## Test Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| User | user@yolo.co | user123 | Browse, cart, checkout, order history |
| Partner | partner@yolo.co | partner123 | Partner dashboard, product management |
| Admin | admin@yolo.co | admin123 | Full admin access |

## Authentication

Mock auth via Zustand + localStorage. Pages:
- `/login` — Email + password, GSAP staggered entrance, sonner toasts
- `/signup` — Name + email + password + confirm, terms checkbox
- `/partner` — 3-step wizard (business info → description → confirm)

All auth pages feature: GSAP entrance animations, motion/react micro-interactions on buttons (whileHover/whileTap), prefers-reduced-motion fallbacks.

## Checkout

`app/checkout/page.tsx` — animated inputs (`AnimatedInput`), `zod` validation, methods: **Visa** (card), **Orange Money**, **MTN MoMo**, **Cash on Delivery**, shipping (Yaoundé/Cameroun/CEMAC), promo, FCFA total, WhatsApp fallback, page transition, skeletons per step.

## Promo / Discounts

Codes: `YOLO10` 10%, `KENNEDY20` 20% ≥80k FCFA, `WHATSAPP5` 5% — see `lib/promo.ts` + `applyPromo`.

## Brand

**YOLO — Avenue Kennedy, Yaoundé, Cameroun · yolo.co · hello@yolo.co · WhatsApp +237 699 00 00 00** · FCFA · #1 enterprise city store.
