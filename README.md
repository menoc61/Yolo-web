<div align="center">
  <img src="public/logo-dark.png" alt="YOLO" width="220" />
  <p>A focused electronics storefront for Yaounde, Cameroon.</p>
  <p><a href="https://github.com/menoc61/animatedlayout/actions/workflows/ci.yml"><img src="https://github.com/menoc61/animatedlayout/actions/workflows/ci.yml/badge.svg" alt="Continuous integration" /></a> <a href="https://yolo-cm.vercel.app"><img src="https://img.shields.io/badge/demo-Vercel-black?logo=vercel" alt="Vercel demo" /></a> <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" /></a> <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript" alt="TypeScript strict mode" /></a> <a href="https://bun.sh/"><img src="https://img.shields.io/badge/runtime-Bun-000000?logo=bun" alt="Bun runtime" /></a></p>
</div>

## Demo

**[Open the Vercel test deployment](https://yolo-cm.vercel.app)**

This is the current test deployment. Its metadata, Open Graph URLs, JSON-LD, sitemap, and robots file use `yolo-cm.vercel.app`. Update them together when the permanent domain is approved.

## About

YOLO is a mobile-first ecommerce application for electronics and smart accessories in FCFA (XAF). The catalog includes computers, audio devices, wearables, charging products, smart-home devices, and peripherals.

The app includes:

- Product discovery with search, category filters, price filters, sorting, and pagination
- Product detail pages with ratings, stock state, recommendations, and structured data
- Persistent cart and wishlist state
- Visa, Orange Money, MTN MoMo, and cash-on-delivery checkout flows
- French and English interface content
- Responsive layout, accessible motion, PWA metadata, offline support, and SEO metadata

## Project Scope

YOLO is a complete storefront ecosystem rather than a catalog page. It includes:

- A responsive public storefront with featured products, search, filters, sorting, pagination, and product recommendations
- Product detail pages with image carousels, ratings, inventory state, discount display, structured Product JSON-LD, and static route generation
- Client-side commerce state for cart, wishlist, authentication, orders, and checkout progress, persisted through Zustand where appropriate
- Checkout support for Visa, Orange Money, MTN MoMo, cash on delivery, FCFA totals, shipping zones, promotions, validation, and WhatsApp fallback
- French and English content, mobile navigation, keyboard-accessible controls, reduced-motion handling, loading skeletons, and error boundaries
- PWA support through a manifest, generated dark and white logo icons at favicon, 192px, and 512px sizes, service-worker support, and an offline page
- Search-friendly metadata through canonical URLs, Open Graph, Twitter cards, robots rules, sitemap generation, organization JSON-LD, and product JSON-LD
- An electronics-only catalog boundary enforced in the data access layer and checked in CI

## Stack

| Area | Technology |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript |
| Runtime | Bun 1.3.14, Node.js 20+ |
| Data and state | TanStack Query, Zustand, typed JSON catalog |
| UI | Tailwind CSS 4, project CSS tokens, Motion, GSAP |
| Validation | ESLint, catalog validator, Next.js production build |
| Hosting | Vercel |

## Quick Start

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality Gates

Run the same checks used by CI before opening a pull request:

```bash
bun run check:catalog
bun run lint
bun run build
```

The [CI workflow](.github/workflows/ci.yml) runs on every push and pull request. The catalog check rejects any product that is not in the `Electronics` category. The build generates the production routes and validates the Vercel-compatible Next.js output.

## Vercel Deployment

No custom server is required.

1. Import `menoc61/animatedlayout` into Vercel.
2. Keep the framework preset as Next.js.
3. Set the package manager to Bun when prompted.
4. Use `bun run build` as the build command.
5. Deploy the project.

The current demo uses no required environment variables. Add secrets only through Vercel project settings and never commit them.

### CLI Deployment

Install and authenticate the Vercel CLI once:

```bash
bunx vercel login
bunx vercel link
```

Then use the guarded deployment scripts:

```bash
bun run deploy:preview
bun run deploy:vercel
```

Both commands validate the electronics-only catalog and complete a production build before deployment. `deploy:preview` creates a preview deployment; `deploy:vercel` deploys to production. The Vercel CLI reads its authentication from your local session, so no token belongs in the repository.

## Repository Map

```text
app/                   Routes, layouts, metadata, manifest, sitemap, robots
components/            Storefront, UI, checkout, auth, and SEO components
context/               Locale and translation context
data/products.json     Electronics catalog source of truth
hooks/                 Product, recommendation, motion, and reduced-motion hooks
lib/                   Catalog access, currency, promotions, and shared types
public/                Logos, generated icons, OG image, service worker, offline page
scripts/               Icon generation and catalog validation
stores/                Cart, wishlist, auth, and order state
.github/workflows/      Push and pull-request CI
```

## Catalog Contract

Product data lives in `data/products.json` and is exposed through `lib/products.ts`. Every product must:

- Use the `Electronics` category.
- Include four valid product image URLs.
- Include price, inventory, availability, rating, review count, and audit timestamps.
- Use the shared FCFA helpers for displayed prices.

Do not add apparel, footwear, beauty, decor, or other non-electronic categories.

## Collaboration

Read [CONTRIBUTING.md](CONTRIBUTING.md) before making changes. Collaboration is invitation-only. Keep commits focused, document user-facing changes, include screenshots for visual work, and wait for CI before merging.

## Ownership and License

YOLO retains exclusive ownership of the application ecosystem and all associated source, product, design, brand, data, documentation, configuration, and deployment materials. This repository is closed source and proprietary. See [LICENSE](LICENSE).

## Contact

YOLO, Avenue Kennedy, Yaounde, Cameroon<br />
hello@yolo.co<br />
WhatsApp: +7 901 180 53 50
