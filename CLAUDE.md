# CLAUDE.md

Guidance for Claude Code sessions working in this repository.

## Project

**Çarshia** — a Kosovo-scoped storefront boilerplate that turns a public
Instagram handle into a ready-to-deploy heritage-artisan storefront. Day-one
the repo ships with **Autentika Gjakovë** as its default brand; re-brand it
by running `/scaffold-storefront @somehandle` in this Claude Code session
(see `.claude/skills/scaffold-storefront/SKILL.md`).

For *why* the repo is shaped this way — Scaffold session, Slot, Showcase
post, Context post, Archetype, Theme tokens, Brand voice — read
[`docs/meta/CONTEXT.md`](docs/meta/CONTEXT.md) and the ADRs under
[`docs/meta/adr/`](docs/meta/adr/).

The single source of truth for brand identity is
[`brand.config.ts`](brand.config.ts). When re-branding manually, edit that
file plus the slots listed in the scaffold skill spec.

Stack: Next.js 16 / React 19 / TypeScript (strict), Prisma 7 + PostgreSQL
(via `@prisma/adapter-pg`), Auth.js v5 (next-auth beta), next-intl, Tailwind
CSS v4, shadcn + Base UI components, Stripe (PaymentIntents + SetupIntent),
zustand, motion. Package manager: **pnpm**.

## Key commands

- Install: `pnpm install` (postinstall runs `prisma generate`)
- Dev server: `pnpm dev` (http://localhost:3000)
- Build: `pnpm build` (runs `prisma generate` then `next build`)
- Lint: `pnpm run lint` — Typecheck: `pnpm run typecheck`
- Format: `pnpm format` / `pnpm format:check`
- DB: `pnpm db:migrate` (dev migration), `pnpm db:deploy` (apply, CI/prod),
  `pnpm db:seed`, `pnpm db:studio`, `pnpm db:reset`, `pnpm db:generate`
- **Standard pre-done verification (always run before finishing):**
  `pnpm run typecheck && pnpm run lint && pnpm run build`

## Architecture & conventions

- App Router with route groups under `app/`: `(shop)` (catalog, product,
  cart, wishlist, checkout, order(s), profile), `(auth)` (login, signup,
  verify-otp, forgot/reset password), `admin` (role-gated layout),
  `api/auth` (Auth.js handler).
- Mutations are **Server Actions in `lib/actions`** with Zod validation, auth
  checks, and `revalidatePath`.
- Read data via **server-only queries in `lib/queries`** (catalog, product,
  orders, admin).
- Shared Zod schemas live in `lib/validations`.
- UI primitives are shadcn / Base UI in `components/ui`; reusable pieces in
  `components/shared` and feature folders (layout, catalog, product, ...).
- Design tokens are Tailwind v4 `@theme` directives in `app/globals.css` —
  edit tokens there, not ad-hoc CSS.
- Animation helpers are in `components/shared/motion.tsx` (FadeIn,
  FadeInWhenVisible, Stagger*) and respect `prefers-reduced-motion`; reuse
  them instead of inlining `motion`. Entrance animations play **only on the
  first page load** — by design they do NOT replay on client-side navigation
  (filter/sort/pagination, list↔detail return) to avoid grid flicker.
- Catalog filtering/sorting/pagination is server-rendered from URL search
  params. All catalog navigations (filter, sort, pagination, search) MUST go
  through `useCatalogTransition()`
  (`components/catalog/catalog-transition.tsx`) — never a naked
  `router.push` — so the current list stays visible (dimmed via
  `CatalogPending`) instead of being replaced by the route `loading.tsx`
  skeleton on every searchParam change.
- Detail queries that run in both `generateMetadata` and the page (e.g.
  `getProductBySlug`) are wrapped in React `cache()` so they hit the DB once
  per request — keep that pattern for any new such query.
- Middleware protects private routes and `/admin`.

## i18n RULE (important)

- Every user-facing string MUST exist in **both** `messages/en.json` and
  `messages/sq.json`, under the **same key path**. Never add a key to only
  one file.
- `sq` (Albanian) is the **default** locale; `en` is the alternative. Locale
  is resolved per request from a `LOCALE` cookie in `i18n/request.ts`.
- Server components: `getTranslations` from `next-intl/server`.
- Client components: `useTranslations` from `next-intl`.

## Gotchas

- `pnpm build` runs `prisma generate` first; it (and the app) need
  `DATABASE_URL` and `DIRECT_URL` set, so copy `.env` from `.env.example`
  before building or running.
- Local Postgres runs via `docker compose up -d db` and is exposed on **host
  port 5433** (matches the URLs in `.env.example`).
- Production uses Neon: pooled URL → `DATABASE_URL`, direct URL →
  `DIRECT_URL`; also set `AUTH_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`.
- Auth.js v5 is a beta (`next-auth@5.0.0-beta`); follow existing patterns in
  `lib/actions/auth.ts` and `lib/session.ts`.
- Edit only what the task requires; keep changes surgical and consistent with
  existing conventions.
