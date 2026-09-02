<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# YOLO — Agents Guide (scalable, maintainable, enterprise)

## Contract: yolo.co · Avenue Kennedy, Yaoundé, Cameroun · FCFA

- **Domain:** `https://yolo-cm.vercel.app` (`metadataBase`). All canonical/OG use it.
- **Store:** Avenue Kennedy, Yaoundé, Centre, Cameroun. Footer/header/contact use it. WhatsApp `+7 901 180 53 50`, `hello@yolo.co`.
- **Currency:** **FCFA (XAF)** everywhere via `lib/currency.ts` `formatFCFA`/`formatPrice` (USD×620). Never `$`. Add new price via those helpers.
- **City:** enterprise rating/feedback, outOfStock, inventory, createdAt/By, deletedAt/By on `Product` (`lib/types.ts`, `data/products.json`).

## Architecture

- **Data external:** `data/products.json` is source of truth. `lib/products.ts` (client) + `lib/products.server.ts` (`"use cache"`). Do not inline MOCK_ elsewhere.
- **State:** Zustand `yolo-cart` persist versioned, TanStack Query for products (`hooks/useProducts.ts`). Parallel fetch with `Promise.all`, no waterfalls (vercel best practice).
- **Caching:** `"use cache"` only in `*.server.ts` (not client). Enable `cacheComponents` when ready in `next.config.ts`.
- **Mobile-first:** Viewport `device-width`, `640/1024` grids (`product-grid`), `44px` min tap, hover gated `hover:hover and pointer:fine`, `useReducedMotion` on every motion.
- **SEO/speed:** `generateStaticParams` per `[slug]`, `next/image` `fill`+`sizes`+`blurDataURL`+`fetchPriority`, `formats avif/webp`, `minimumCacheTTL 30d`, `content-visibility`, skeletons `components/ui/Skeleton.tsx`.
- **Filters/pagination:** `app/products/page.tsx` — AnimatePresence `opacity/translateY` `0.32s --ease-out`, `pageSize 6`, reset on filter, `aria` on pagination.

## Animations — do not regress

- **Skills:** `iart-ai/web-animation-skills` (60fps, micro-interaction, page-transition, accessible, gsap-web) + `emilkowalski/animate` + `greensock/gsap-*`. Installed via `npx skills add`.
- **Rules:** `transform`/`opacity` only, `duration 100–250ms` for UI, `ease [0.16,1,0.3,1]` or `var(--ease-out) cubic-bezier(0.23,1,0.32,1)`, stagger `0.06`, `whileTap scale 0.96` spring `400/30`, `prefers-reduced-motion` guard, `hover` gated.
- **Page transition:** `components/cms/PageTransition.tsx` — GSAP `opacity/y` on `pathname`. All pages mounted inside it in `app/layout.tsx`.
- **Inputs/buttons:** `components/ui/AnimatedInput.tsx` (floating label, focus ring, error `AnimatePresence`), `ProductActions` loading spinner micro-interaction.
- **Background micro:** `Newsletter` shimmer, `Hero` Lenis `1.2s` + `ScrollTrigger.batch`. Do not animate `width/height/top/left`.

## Checkout — enterprise

`app/checkout/page.tsx` must support: Visa, Orange Money, MTN MoMo, Cash on Delivery, shipping (Yaoundé/Cameroun/CEMAC), promo `lib/promo.ts`, FCFA totals, validation (zod), animated inputs, success WhatsApp fallback, page transition. Keep methods extensible.

## Payments / Promo

- Add new code in `lib/promo.ts` + reflect in `Newsletter`/cart. Use `applyPromo(totalFCFA, code)` — returns `{total, discount, error}`. Handle `minAmountFCFA`.

## Adding a product

1) Edit `data/products.json` (include `rating`, `reviewCount`, `views`, `createdAt`, `createdBy`, `inventory`, `outOfStock`).
2) Images: 4 `images.unsplash.com w=800&q=80`, `next/image` will optimize to avif/webp.
3) Verify `formatPrice` used everywhere, `ProductRating` shows stars+count.

## PWA / Icons / Social

- Regenerate brand assets with `bun run icons` (`scripts/generate-icons.ts`, zero-dependency PNG encoder). Outputs `public/icons/icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, and `public/og.png` (1200×630 social card).
- Manifest: `app/manifest.ts` (auto-served at `/manifest.webmanifest`). Metadata in `app/layout.tsx` references `/og.png`, `/icons/icon-192.png` (OG + apple touch).
- Additives: `public/sw.js` (network-first navigation → offline fallback), `public/offline.html`, `components/PwaInstall.tsx` (SW register + beforeinstallprompt). WhatsApp links appear inline (footer, contact, checkout) via `wa.me/+79011805350`.

## Checklist before PR

- [ ] `bun run build` passes (typecheck; ignore pre-existing hook errors if noted)
- [ ] No `$` hardcoded — `formatFCFA`/`formatPrice`
- [ ] `prefers-reduced-motion` tested, keyboard nav (Esc closes overlay, arrows carousel)
- [ ] Skeletons on every async boundary, `PageTransition` intact, hamburger same button toggles (no separate X)
- [ ] `yolo.co` + Avenue Kennedy + WhatsApp visible in footer/header/contact/newsletter

## Skills to invoke

- Animations: `iart-ai/web-animation-skills` (micro-interaction, page-transition, 60fps, accessible), `emilkowalski/animate`, `greensock/gsap-*`
- Perf: `vercel-react-best-practices` (async-parallel, bundle, server-cache, rerender-memo)
