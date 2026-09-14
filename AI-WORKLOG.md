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

