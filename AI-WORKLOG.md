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

## Admin login page

- AI: built the `/admin/login` UI — email/password form on a shadcn `Card`, no submit logic yet (auth wiring is a separate step). Header's "Admin" link now points here instead of `/admin/products`.
- Candidate: edited the submit button's styling directly in the file after AI's first pass.

## Authorization — JWT access + refresh

- AI: added a `User` model + seeded `admin@mail.com`/`12345678` (bcrypt-hashed at seed time); JWT signing/verification (access 15m / refresh 7d, separate secrets), refresh token hash+expiry stored on the user row and rotated on every use; `POST /api/auth/login|refresh|logout`; `proxy.ts` guards `/admin/*` and `/api/admin/*`, silently rotating an expired-but-refreshable session itself so an idle admin is never signed out. Login/logout wired up; the header swaps its "Admin" link for a "Logout" button while inside `/admin/*` (removed the separate admin layout bar this replaced). Redirect targets consolidated into a `ROUTES` constant; simplified the client `authFetch` wrapper to redirect straight to login on `401` instead of attempting its own refresh, since `proxy.ts` already refreshes before the request reaches the handler — the retry was dead code.
- Candidate: chose the design — access+refresh JWTs, refresh persisted as a single hash+expiry on `User` (one session per admin), automatic silent refresh. Caught the guard file using Next.js's now-deprecated `middleware.ts` convention (renamed to `proxy.ts` in this version) — migrated it. Had auth logic reorganized several times (`lib/` → `api/auth/`/`helpers/`, `hashRefreshToken` merged into `helpers/jwt.ts`). Caught and fixed: header's "Admin" link always going to login even when authenticated; a stuck "Logging in..." state after successful login; idle admins losing their session despite a valid refresh token (root cause: a cookie `path` scoping bug); authenticated users being able to reach `/admin/login`. Verified end-to-end with `curl` at each step (unauthenticated `PATCH` → `401`, login sets cookies, authenticated `PATCH` → `200`, refresh rotates both tokens, logout revokes server-side, idle session with expired access but valid refresh stays in, fully dead session redirects to login).

## Automated tests

- AI: set up Vitest against a real ephemeral SQLite DB (`vitest.config.ts`, `tests/globalSetup.ts` runs `prisma migrate deploy` into `prisma/test.db`, torn down after the run — no mocked ORM, no external services). 59 tests across 10 files: JWT sign/verify + `hashRefreshToken` (`tests/helpers/jwt.test.ts`), password hashing (`tests/helpers/passwords.test.ts`), `rotateSession` (`tests/helpers/refreshSession.test.ts`), the product/login zod schemas at their exact limits (`tests/lib/productValidation.test.ts`, `tests/api/auth/validation.test.ts`), and the critical scenarios named in the spec by calling route handlers directly — unauthenticated/invalid-data `PATCH` on the admin product API, draft leakage via the public catalog API and page, login/refresh/logout cookie behavior and generic-error messaging, and `proxy.ts`'s own auth gate for both `/admin/*` and `/api/admin/*` (`tests/proxy.test.ts`, `tests/routes/*.test.ts`).
- Candidate: picked the scope — helpers, validation, and the route handlers/`proxy.ts` where auth+validation+draft-protection actually get enforced, over UI component tests (lower ROI here, noted as a known limitation). **AI's tests caught a real bug**: `signToken` had no `jti`, so two tokens signed for the same user+ttl within the same second were byte-for-byte identical — `rotateSession`'s "old refresh token is invalidated" guarantee could silently fail in that window. Fixed by adding a random `jti` to every signed token (`helpers/jwt.ts`). Confirmed by rerunning `tests/helpers/refreshSession.test.ts`, which failed before the fix and passes after.
