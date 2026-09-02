# Collaboration Guide

Thank you for helping improve YOLO. This repository is maintained as a private project, so collaboration is invitation-only and all changes require owner approval.

## Before You Start

- Confirm the change with the project owner before implementation.
- Keep the work focused on the agreed issue or feature.
- Do not add credentials, customer data, payment information, or private deployment values.
- Do not introduce non-electronics products or categories.

## Development

```bash
bun install
bun run dev
```

Use the existing Next.js, React, TypeScript, CSS, and state-management patterns. Keep user-facing prices in FCFA through `lib/currency.ts` and keep product data in `data/products.json`.

## Validation

Run these commands before requesting review:

```bash
bun run check:catalog
bun run lint
bun run build
```

The catalog check, lint, and production build also run through GitHub Actions on every push and pull request.

## Pull Requests

Include:

- A concise summary of the change.
- The user-facing behavior affected.
- Validation commands and their results.
- Screenshots for visual changes, including mobile when relevant.
- Any environment, migration, or deployment notes.

Keep commits small and descriptive. Do not merge with failing CI or unresolved review comments.

## Deployment

Preview deployments use [yolo-cm.vercel.app](https://yolo-cm.vercel.app). Do not change production metadata, canonical URLs, or deployment settings without owner approval.

## License and Ownership

This project is proprietary. Contributions are submitted for inclusion in the private YOLO project and do not grant contributors permission to redistribute the source code. See [LICENSE](LICENSE) for the full terms.
