# Product Content Studio

A small product content editor for an online store. A manager edits a product's description and SEO fields, saves changes, and publishes it; visitors see a catalog of published products and can open their pages.

## Tech stack

- **Framework:** Next.js (App Router) — used for both the frontend and the backend (Route Handlers as the REST API), so there's a single codebase and a single deploy instead of a separate Express server.
- **Language:** TypeScript
- **Database / ORM:** SQLite via Prisma (a driver adapter, `@prisma/adapter-better-sqlite3`, is required — Prisma 7 no longer ships a built-in engine)
- **Auth:** JWT access + refresh tokens (see [Authentication design](#authentication-design) below)
- **Validation:** Zod, one schema shared by the client form and the server route handler
- **UI:** Tailwind CSS + shadcn/ui
- **Testing:** Vitest, against a real ephemeral SQLite database (see [Testing](#testing))

## Prerequisites

- Node.js 20 or newer
- npm

## Getting started (clean local run)

```bash
# 1. Install dependencies (also runs `prisma generate`)
npm install

# 2. Configure environment
cp .env.example .env
# Generate real secrets for the two JWT_*_SECRET values, e.g.:
openssl rand -base64 32
openssl rand -base64 32
# Paste the two outputs into JWT_ACCESS_SECRET / JWT_REFRESH_SECRET in .env.
# DATABASE_URL and the admin credentials already have working defaults.

# 3. Create the database and seed it (migration + demo data + admin user)
npm run setup

# 4. Start the app
npm run dev
```

The app runs at `http://localhost:3000`. The public catalog is at `/`, the admin panel at `/admin`.

### Test admin login

After `npm run setup`, log in at `/admin/login` with:

- **Email:** `admin@mail.com`
- **Password:** `12345678`

(Overridable before seeding via the optional `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars — see `.env.example`.)

The seed also creates three demo products: two published, one draft (visible in the admin list, only the published two show up in the public catalog).

## Available scripts

| Command                       | Description                                       |
| ----------------------------- | ------------------------------------------------- |
| `npm run dev`                 | Start the dev server                              |
| `npm run build` / `npm start` | Production build / start                          |
| `npm run lint`                | ESLint                                            |
| `npm run format`              | Format the codebase with Prettier                 |
| `npm run format:check`        | Check formatting without writing changes          |
| `npm test`                    | Run the automated test suite (Vitest)             |
| `npm run verify`              | Format check + lint + test + build, in that order |
| `npm run setup`               | Run migrations + seed (first-time / reset setup)  |
| `npm run db:migrate`          | Apply Prisma migrations only                      |
| `npm run db:seed`             | Re-run the seed only                              |

## Testing

```bash
npm test
```

This is fully self-contained — no external services or API keys are needed. `tests/globalSetup.ts` provisions a dedicated, ephemeral SQLite database (`prisma/test.db`) by running the real Prisma migrations against it before the suite starts, and deletes it afterwards. Nothing here mocks the ORM; the integration-level tests hit a real (if temporary) database.

**Current coverage: 67 tests across 12 files.**

- **Helpers** (`tests/helpers/`): JWT signing/verification (valid roundtrip, wrong secret, expired token), `hashRefreshToken`, password hashing, `rotateSession` (the refresh-rotation logic used by both `/api/auth/refresh` and the route guard), and the product-edit Zod schema at its exact character limits.
- **Validation** (`tests/api/auth/validation.test.ts`): the login schema's edge cases.
- **Route handlers & the auth guard** (`tests/routes/`, `tests/proxy.test.ts`): the specific critical scenarios the task calls out by name — an unauthenticated or invalid-data `PATCH` on the admin product API is rejected and does not persist; a draft product never leaks through the public catalog API or page (`404` either way); login/refresh/logout set and clear cookies correctly and return a generic error message on bad credentials (no user enumeration); a stolen/reused refresh token is rejected after rotation; `proxy.ts` itself blocks unauthenticated admin requests and silently refreshes an idle-but-still-valid session; the LLM-generation endpoint stays within the editor's character limits and 404s for an unknown product.

**Why this scope:** the task requires covering "key business logic and critical scenarios," not exhaustive coverage. Helpers, validation, and the route handlers/guard are where auth, validation, and draft-protection are actually enforced — that's also where real bugs showed up during manual testing while building the feature (a cookie-scoping bug, an idle-session bug). UI/component tests (e.g. React Testing Library on the product editor form) were deliberately left out of scope given the time budget — the editor's client-side behavior (disabled states, error rendering) was checked manually instead. This is a known limitation, not an oversight.

**Why Vitest over Jest:** the project is ESM-first (`"module": "esnext"`, no Babel), and Vitest (built on Vite) handles ESM + TypeScript + the `@/*` path alias with near-zero config, whereas Jest needs extra setup to run cleanly in a pure-ESM project. The test API itself is Jest-compatible (`describe`/`it`/`expect`).

See `AI-WORKLOG.md` for how AI was used to build the tests and a concrete bug the suite caught before it shipped.

## Authentication design

JWT access (15 min) + refresh (7 days) tokens, both `httpOnly` cookies, signed with separate secrets.

- The refresh token is never stored raw — only its SHA-256 hash + expiry, on the single `User` row (`refreshTokenHash`, `refreshTokenExpiresAt`). There's one demo admin and no multi-session requirement, so this is a single-session-per-admin model, not a sessions table.
- Every successful refresh **rotates** both tokens (new access + new refresh issued, old refresh hash overwritten) — an old refresh token can't be reused afterwards.
- `proxy.ts` (Next's renamed `middleware.ts` convention in this version) guards `/admin/*` and `/api/admin/*`. If the access token is missing/expired but the refresh token is still valid, `proxy.ts` rotates the session itself before the request reaches the page/route — so an admin who's simply idle (not actively clicking around) is never signed out while the refresh token is still valid, without needing a client-side round trip first.
- Client-side mutations (`patchProduct`, via `authFetch`) redirect to `/admin/login` on a `401` — which in practice only happens once the refresh token itself has expired, since `proxy.ts` already handles the refreshable case upstream.
- Registration, password reset, and roles are explicitly out of scope per the task.

## LLM-assisted content generation (bonus)

In the product editor, **Generate with AI** asks Gemini (`gemini-3.6-flash`, via `@google/genai`) to draft a description, SEO title, and SEO description in Ukrainian, based on the product's (read-only) name and characteristics. Gemini was picked specifically because it has a genuinely free tier (no card required) at [aistudio.google.com](https://aistudio.google.com/apikey) — reviewers can verify the real-model path without spending anything.

- **Schema-constrained output, not free-text parsing:** the request sets `responseMimeType: "application/json"` and a `responseSchema` whose `minLength`/`maxLength` match the editor's own limits (1000/60/160 chars), then the parsed JSON is validated again against a Zod schema server-side before it's trusted — defense in depth, not just a prompt instruction.
- **Nothing is auto-applied.** The suggestion renders in a separate preview panel with **Apply** / **Discard**. Only **Apply** copies the three fields into the actual form inputs — it doesn't save or publish, and generating a suggestion never touches whatever you've already typed unless you explicitly apply it.
- **Errors don't lose work or hang the UI:** a failed generation (network error, rate limit, malformed model output) shows a toast and leaves the form exactly as it was — caught via the SDK's `ApiError` (branching on `.status`, e.g. `429` for rate limits) mapped to clean JSON error responses, not a raw 500.
- **Reproducible without an API key:** if `GEMINI_API_KEY` isn't set, `helpers/generateProductContent.ts` returns a deterministic mock (built from the product's own title/attributes) instead of calling the API — the response carries `mocked: true`, and the UI shows an explicit "Mock response" badge on the preview. This is the default in this repo's own `.env.example`, so `npm test` and a from-scratch `npm run setup` both exercise the mock path with no credentials and no network calls.
- **What's been verified:** the mock path end-to-end (automated tests, plus a manual `curl` pass — auth-gated, 404 for an unknown product, mock badge rendering) **and the real model** — manually verified via `curl` against a live `GEMINI_API_KEY`: `mocked: false`, natural Ukrainian output, all three fields within their character limits (492/1000, 59/60, 143/160 in the run that was checked). Note the model name did need a fix along the way — `gemini-2.5-flash` had been retired for new API keys since this was first written; `gemini-3.6-flash` is the current free-tier Flash model.

To try it against the real model: get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey), add `GEMINI_API_KEY=...` to `.env`, and restart the dev server.

## CI/CD (bonus)

`.github/workflows/ci.yml` runs on every push/PR to `main`:

1. `verify` job — installs deps, writes a throwaway `.env` (dummy JWT secrets, same shape as `.env.example`), applies migrations, then runs `npm run verify` (format check → lint → test → build), identical to what you'd run locally.
2. `deploy` job — only runs on a push to `main`, and only if `verify` succeeded (`needs: verify`). It triggers a deploy by POSTing to a Render **Deploy Hook** URL — Render itself does nothing on push; the hook is the only thing that starts a deploy, so a failing pipeline never ships.

**To wire up the Render side** (one-time setup, not done as part of this session — no Render account was created here):

1. Create a Render **Web Service**, connect this GitHub repo.
2. Build command: `npm ci && npm run build`. Start command: `npm run db:migrate:deploy && npm start`.
3. Set env vars in Render's dashboard (not in the repo): `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and optionally `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `GEMINI_API_KEY`.
4. Turn **off** Render's own "Auto-Deploy" toggle — otherwise Render deploys on every push regardless of CI, defeating the point of gating on `verify`.
5. Render Settings → Deploy Hook → copy the URL → add it as a GitHub repo secret named `RENDER_DEPLOY_HOOK_URL` (Settings → Secrets and variables → Actions).

**Known caveat:** Render's default disk is ephemeral — SQLite data (including the seeded admin user and demo products) resets on every deploy/restart unless you attach a Render persistent disk and point `DATABASE_URL` at a path on it. The start command re-applies migrations on boot either way, but does **not** re-seed automatically (seeding uses `upsert`, so re-running it on every restart would silently revert any edits made through the admin panel back to the seed data — run `npm run db:seed` manually once instead, e.g. via Render's shell).

## Known limitations / unfinished parts

- **No UI/component or end-to-end tests** — covered manually instead (see [Testing](#testing)). Would add React Testing Library for the editor form and/or Playwright for the full login → edit → publish flow with more time.
- **Render deploy not actually verified** — the GitHub Actions `verify` job runs and passes in this repo, but no Render service was created/connected in this session, so the `deploy` job and the live app have not been tested end-to-end.
- **Other bonus tasks not attempted:** Shopify import, a Figma-sourced design pass.

## Time spent

~6–8 hours for the core implementation and tests, in line with the task's time budget.
