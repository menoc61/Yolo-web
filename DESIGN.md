# YOLO — Design System

> Avenue Kennedy · Yaoundé, Cameroun · FCFA (XAF) · **Dark-only UI**
> This file is the contract. Every new component must read as "YOLO". When in doubt, follow this file.

---

## 1. Theme — Dark Only

There is **no light theme**. Do not reintroduce `next-themes`, theme toggles, or `:root`/`.dark` swatches.

| Token | Value | Usage |
|-------|-------|-------|
| Body background | `#0b0b0b` | Page background (hardcoded in `globals.css`) |
| Elevated surface | `#111` | Drawers, modals, sheets, cards |
| Inset surface | `#0d0d0d` | Reveal zones, footer sections |
| Hairline / border | `#1a1a1a` / `#222` | Dividers, inputs, outlines |
| Text primary | `#fff` | Headings, primary buttons |
| Text muted | `#555` / `#666` / `#777` | Body, meta, hints, breadcrumbs |
| Accent — service/ok | `#4ade80` | Delivery times, success, checked items |
| Accent — danger | `#ef4444` | Rupture, errors, active wishlist |
| Accent — WhatsApp | `#25D366` | WhatsApp links/buttons |
| Accent — warning | `#facc15` on `#0b0b0b` | Low-stock warnings |

Hardcode hexes. No color tokens system beyond the values above.

## 2. Typography

- **Family:** Josefin Sans — `var(--font-sans)`, loaded via `next/font/google` in `app/layout.tsx`.
- **Headings:** `uppercase`, `font-weight: 700`, `letter-spacing: 0.04–0.08em`.
- **Eyebrow / label:** `0.6rem`, `uppercase`, `letter-spacing: 0.2–0.3em`, `color: #666`.
- **Body copy:** `0.85rem`, `font-weight: 300`, `line-height: 1.7–1.9`, `color: #555–#888`.
- **Page title:** `clamp(1.8rem, 4vw, 2.6rem)`, uppercase, 700.
- **Hero / big display:** `clamp(2rem, 5vw, 4.5rem)`.

## 3. Layout & Spacing

- Page wrapper: `.page-content` → `.container` (centered, max-width from `globals.css`).
- Micro-space `8–12px` · Inner padding `16–24px` · Section gap `40–80px`.
- **Mobile-first.** Key breakpoints: `640px` (single column), `1024px` (grids).
- Hover-only UI gated with `@media (hover: hover) and (pointer: fine)`.
- 2-col grids collapse to 1-col below ~900px. Always test at `375px` width.
- Touch targets: minimum `44px` on tap actions.
- Sticky elements (header, checkout summary): account for `top` offset below header.

## 4. Components & Patterns

- **Product card:** image (3/4), discount badge top-left, heart top-right, count badge bottom-right of image. Overlay actions appear on hover (desktop) / always reachable (mobile).
- **Carousel (`AnimatedCarousel`):** progress bar bottom, dots bottom-center, count badge bottom-right (`right-3 bottom-8`). **Never** place badges top-right where the wishlist heart lives.
- **Buttons:** `.btn-primary` white bg / black text · `.btn-secondary` transparent with border. Uppercase, letter-spacing, `font-size: 0.7rem`.
- **Bottom sheet:** fixed, left/right 0, bottom 0, `z-index 95`, `background #111`, spring `{ stiffness: 340, damping: 34 }`, backdrop `rgba(0,0,0,0.72)` + blur, Escape closes.
- **Auth modal:** 3 views (login / signup / forgot) in tabs, `AnimatePresence mode="wait"` slide `x: ±20`, spring entrance `{ stiffness: 400, damping: 28 }`, z-index 90.
- **Forms:** `AnimatedInput` with floating label, `44px`+ height, error text `#ef4444`, Zod v4 validation on submit.
- **FAQ accordion:** borderless rows, `+` rotates 45°, `AnimatePresence` height animation.

## 5. Animation Rules (do not regress)

- **Animate only `transform` + `opacity`.** Never width/height/top/left/box-shadow.
- **Durations:** 100–250ms for UI feedback. Page reveals 400–800ms.
- **Easing:** `cubic-bezier(0.23, 1, 0.32, 1)` (`var(--ease-out)`) or spring `{ stiffness: 400, damping: 30 }`.
- **Micro-interactions:** `whileTap { scale: 0.96 }`, `whileHover { scale: 1.02–1.05 }`.
- **Stagger:** `0.06–0.08` for lists.
- **GSAP** for page/section entrance (`.page-content [data-anim]`, `useSectionReveal`).
- `useReducedMotion()` guard on **every** motion — disable transforms, return duration `0.01ms`.
- Body visibility handled by `ensure-body-visible` script — keep it.

## 6. Commerce Rules

- **Currency:** FCFA only — `formatPrice`/`formatFCFA` from `lib/currency.ts` (USD × 620). Never `$` or CHF.
- **Brand facts:** Avenue Kennedy, Yaoundé, Cameroun · `+7 901 180 53 50` · `hello@yolo.co` · `yolo.co`. No "Fribourg".
- **Payments:** Visa (Stripe mock), Orange Money, MTN MoMo, Cash on Delivery.
- **Checkout gate:** auth required; unauthenticated click opens the auth modal via `yolo:open-auth`.
- **Promo:** `lib/promo.ts` `applyPromo(totalFCFA, code)`.
- **Product data:** `data/products.json` is source of truth; every product has `rating`, `reviewCount`, `views`, audit fields, `inventory`, `outOfStock`.

## 7. SEO / Perf

- `next/image` with `fill` + `sizes` + `blurDataURL`; `generateMetadata` per `[slug]` with OG/Twitter cards, `yolo.co` canonical.
- `generateStaticParams` for `[slug]`; skeletons at async boundaries.
- `"use cache"` only in `*.server.ts` files.

## 8. Accessibility

- Esc closes overlays/drawers/sheets; focus stays sensible.
- `aria-label` on all icon buttons; `role="dialog"` + `aria-modal` on sheets; `aria-expanded` on accordions.
- Keyboard: arrows in carousel, Enter on tappable cards/sheets.
- Respect `prefers-reduced-motion` and `prefers-reduced-transparency`.