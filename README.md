# Çarshia

> A Kosovo-scoped storefront boilerplate that turns an Instagram handle
> into a ready-to-deploy heritage-artisan shop.

Çarshia (Albanian for *bazaar*) ships as a full working storefront with
the **Autentika Gjakovë** brand as its day-one default. To re-brand it
for any public Instagram account, open this repo in
[Claude Code](https://claude.com/claude-code) and run:

```
/scaffold-storefront @somehandle
```

The skill reads the public IG profile, classifies posts into showcase
(seeds the catalog) and context (atmosphere / hero), extracts a 5-swatch
palette from the profile picture, rewrites `brand.config.ts`, the seed
data, the i18n copy, and the brand-voice `CONTEXT.md`, then starts the
dev server. See [`.claude/skills/scaffold-storefront/SKILL.md`](.claude/skills/scaffold-storefront/SKILL.md)
for the exact contract.

## How to use this repo

This is a **GitHub template repository** — click **Use this template** at
the top of the GitHub page, name your new repo, then clone it. Don't
fork or `git clone` this repo directly for a new brand; the template
button gives the new shop its own clean git history.

```bash
# After clicking "Use this template" on GitHub:
git clone https://github.com/<you>/<your-shop>.git
cd <your-shop>

# 1. Environment — copy the example and adjust if needed
cp .env.example .env
#   Generate an AUTH_SECRET:  openssl rand -base64 32

# 2. Start local Postgres (host port 5433)
docker compose up -d db

# 3. Install dependencies (postinstall also runs `prisma generate`)
pnpm install

# 4. Either keep the Autentika defaults...
pnpm db:migrate && pnpm db:seed && pnpm dev

# ...or open Claude Code and re-brand from an IG handle:
#   /scaffold-storefront @somehandle
```

## What you get

A full-stack Next.js 16 storefront, identical in shape to the reference
[`dardania`](https://github.com/luriank/dardania) deployment:

- **Bilingual AL/EN** — Albanian (`sq`) default, English (`en`) alt;
  cookie-persisted locale via `next-intl`
- **Catalog** — persistent filter sidebar (Category + Brand with
  counts), URL-state-driven search/sort/pagination, dedicated
  `/bestsellers` and `/new-arrivals` pages
- **Search** — diacritic-insensitive substring + `pg_trgm` typo
  tolerance + ⌘K typeahead with recents
- **Cart & wishlist** — server-persisted per user, quick cart sheet +
  full cart page
- **Checkout** — multiple saved addresses (Kosovo-only validation, one
  default per user), COD + Stripe card payments (PaymentIntents +
  webhook + idempotent finalize)
- **Profile** — Amazon-style account hub with saved cards (Stripe
  SetupIntent), order history, address manager
- **Orders & reviews** — order status badges, per-product reviews
- **Auth** — Auth.js v5 (Credentials + bcrypt, JWT sessions); middleware
  protects private routes
- **Admin** — product create / edit / archive / restore and order
  status management, role-gated
- **Themes** — light + Lamplit-bazaar dark via `next-themes`
- **Icons** — Phosphor duotone (navy + gold) — see
  [ADR 0005](docs/adr/0005-duotone-icon-system.md)

## What's in the boilerplate

The dardania storefront's full code plus three additions that make it
re-brandable:

- [**`brand.config.ts`**](brand.config.ts) — the single source of truth
  for the storefront's identity (name, location, tagline, SEO metadata,
  hero image, archetype). The skill rewrites this file.
- [**`.claude/skills/scaffold-storefront/`**](.claude/skills/scaffold-storefront/) —
  the Claude Code skill spec
- [**`docs/meta/`**](docs/meta/) — the architecture decisions and
  glossary that explain *why* the boilerplate is shaped this way:
  - [CONTEXT.md](docs/meta/CONTEXT.md) — Scaffold session, Slot, Showcase post,
    Context post, Archetype, Theme tokens, Brand voice
  - [ADR 0001 — Claude-driven scaffold](docs/meta/adr/0001-claude-driven-scaffold.md)
  - [ADR 0002 — Curated archetype library](docs/meta/adr/0002-curated-archetypes.md)
  - [ADR 0003 — Showcase vs context post classification](docs/meta/adr/0003-showcase-vs-context-post-classification.md)
  - [ADR 0004 — Extracted starter from dardania](docs/meta/adr/0004-extracted-starter-from-dardania.md)
  - [ADR 0005 — Day-one scope is heritage-artisan only](docs/meta/adr/0005-day-one-scope-heritage-artisan-only.md)

## Demo accounts (default seed)

| Role  | Email                            | Password    |
|-------|----------------------------------|-------------|
| User  | `demo@autentika-gjakove.com`     | `demo1234`  |
| Admin | `admin@autentika-gjakove.com`    | `admin1234` |

After scaffolding for a new brand, these emails update automatically
to use the new `brand.emailDomain`.

## Tech stack

| Area       | Choice |
|------------|--------|
| Framework  | Next.js 16 (App Router, RSC, Server Actions, TypeScript `strict`) |
| Language   | TypeScript, React 19 |
| UI         | Tailwind CSS v4 + shadcn / Base UI primitives + Phosphor duotone icons |
| i18n       | `next-intl` — Albanian (`sq`) default, English (`en`) alt |
| Data       | Prisma 7 ORM + PostgreSQL (Neon in prod, Docker locally) via `@prisma/adapter-pg` |
| Auth       | Auth.js v5 — Credentials + bcrypt, JWT sessions |
| Payments   | Stripe — PaymentIntents (card), webhook-driven finalize, SetupIntent (saved cards) |
| Forms      | React Hook Form + Zod |
| State      | Server-backed cart/wishlist (DB); `zustand` client state; URL params for catalog |
| Motion     | `motion` — subtle, respects `prefers-reduced-motion` |
| Theming    | `next-themes` (system / light / dark) |

## Day-one scope

Çarshia ships with **one archetype**, `heritage-artisan` — dardania's
own visual language, generalized. Brands whose IG vibe clashes with
heritage-artisan (sleek modern minimal, streetwear, café/restaurant,
boutique fashion) should wait for additional archetypes. The roadmap
for adding archetypes is in [ADR 0005](docs/meta/adr/0005-day-one-scope-heritage-artisan-only.md).

## Scripts

| Script               | Purpose |
|----------------------|---------|
| `pnpm dev`           | Start the dev server |
| `pnpm build`         | `prisma generate` + `next build` |
| `pnpm start`         | Run the production build |
| `pnpm lint`          | ESLint |
| `pnpm typecheck`     | `tsc --noEmit` |
| `pnpm format`        | Prettier write |
| `pnpm format:check`  | Prettier check |
| `pnpm db:generate`   | Generate the Prisma client |
| `pnpm db:migrate`    | Create + apply a dev migration |
| `pnpm db:deploy`     | Apply migrations (CI / prod) |
| `pnpm db:seed`       | Seed catalog + demo/admin users |
| `pnpm db:studio`     | Open Prisma Studio |
| `pnpm db:reset`      | Reset the DB and re-run migrations |

Standard pre-done verification:
`pnpm run typecheck && pnpm run lint && pnpm run build`.

## Deployment

Identical to dardania — Vercel + Neon. See the `.env.example` for the
five required variables (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`,
`AUTH_URL`, `AUTH_TRUST_HOST`) plus Stripe (`STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
