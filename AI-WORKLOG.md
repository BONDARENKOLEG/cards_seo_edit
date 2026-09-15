# AI-WORKLOG

Tool: **Claude Code** (VS Code extension), model **Claude Sonnet 5** — used throughout the project.

Structured by feature/step, in the order they were built.

## 0. Init

- AI: scaffolded Next.js + Tailwind + shadcn/ui + Prisma (`prisma init`), installed deps, drafted first architecture, built `Header` + stub pages (`/`, `/admin`).
- Candidate: made all architecture calls (Route Handlers instead of Express, JWT cookie, SQLite, Tailwind+shadcn); cut AI's first oversized plan (full route/API/middleware skeleton) down to just the header nav switch.

## Code style

- Candidate: AI's first components had inline Tailwind classes and inline text — defined the convention: classes in a `styles` object, extracted per-route to `<route>.styles.ts`; text via `<route>.copy.ts`, sourced from `locale/en.json` (i18n-style, English only). AI now applies this by default for new files.

## Catalog, product page & admin UI

- AI: built the public catalog + product page, admin products list (with status filter) and product editor form — all on mock data (`mocks/products.ts`), no backend yet.
- Candidate: reviewed and adjusted (spacing tokens, `copy` naming, file/component naming), then asked for several refactors — repeated JSX pulled into dedicated components (`BackButton`, `FormField`, `ProductAttributes`, `ProductFilters`, `ProductRows`) instead of inline `.map()`/`render*` helpers.

## Database & admin API

- AI: added Prisma schema (`Product` model), SQLite migration + seed (3 demo products, matching mock data), switched catalog/product page/admin list/editor reads from mocks to the real DB (`api/getProducts.ts`). Built `PATCH /api/admin/products/[id]` — same zod schema validated client- and server-side, `revalidatePath` so status changes show up immediately.
- Candidate: caught that `DATABASE_URL` had a silent hardcoded fallback duplicating what `.env` was meant to enforce — removed it, made it fail loudly instead. Requested a refactor of the status/sort types (`PRODUCT_STATUS`/`SORT_ORDER`/`PRODUCT_FILTER` as SCREAMING_SNAKE_CASE enums instead of string literals) and of the `api/` file architecture (client-safe fetch calls split into their own files — `api/getProducts.ts` for reads, `api/patchProducts.ts` for the admin mutation — kept separate from the Prisma-importing server code so nothing server-only leaks into the client bundle).


