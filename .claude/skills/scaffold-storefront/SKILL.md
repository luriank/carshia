---
name: scaffold-storefront
description: Scaffold a Kosovo-scoped artisan/heritage storefront from a public Instagram handle. Fetches the profile, classifies posts into showcase (catalog) vs context (atmosphere), rewrites brand.config.ts + seed.ts + messages + CONTEXT.md, downloads images into public/, and starts the dev server. Use when the user invokes "/scaffold-storefront @handle" or asks to scaffold/bootstrap/generate a storefront from an Instagram handle. Day-one supports the `heritage-artisan` archetype only.
---

# scaffold-storefront

This skill turns a public Instagram handle into a populated storefront in
the same shape as the boilerplate's default (Autentika Gjakovë). It is the
single point of entry for spawning a new storefront — there is no CLI.

Read [docs/meta/CONTEXT.md](../../../docs/meta/CONTEXT.md) for the
vocabulary (Scaffold session, Slot, Showcase post, Context post, Archetype,
Theme tokens, Brand voice) and the ADRs under [docs/meta/adr/](../../../docs/meta/adr/)
for the architectural decisions you are operating inside.

## Inputs

- One IG handle, with or without `@`. Example: `@autentika.gjakove`,
  `petras_filigree`, `https://instagram.com/somehandle`.
- Optional override: archetype name (e.g. `heritage-artisan`). If omitted,
  the session picks one. Day-one the only available archetype is
  `heritage-artisan`, so the pick is forced.

## End state

`pnpm dev` serving at `http://localhost:3000` with the new brand's
identity (palette, wordmark, hero copy, products seeded from showcase
posts, atmosphere images available to non-catalog slots). The operator
opens the URL and reviews.

## Steps

### 1. Resolve the handle

Strip leading `@` and any `https://instagram.com/` prefix. Confirm the
canonical handle with the operator in one short sentence before fetching
— a wrong handle wastes the whole session.

### 2. Fetch the public profile

Use `WebFetch` against `https://www.instagram.com/<handle>/`. Extract:

- Profile picture URL (highest resolution available)
- Display name
- Bio text
- Up to 12 most-recent post thumbnails + their permalinks

If `WebFetch` returns the IG login wall or otherwise fails: stop and ask
the operator to paste the page source, or paste post URLs one by one.
**Do not invent posts** — fail loudly instead.

### 3. Research the brand

Use `WebSearch` for `"<brand name>" Kosovo` and `"<brand name>"
<bio keyword>` to understand the brand category, location, and any prior
press. The goal is to know enough to write tasteful sq + en copy in the
brand's voice — not to copy claims into the storefront.

### 4. Classify each post — Showcase vs Context

Look at each fetched post image. Apply the `heritage-artisan` archetype's
classification rule:

- **Showcase post**: item-focused, clean background, single product or
  product-set photographed for sale. Becomes a catalog row.
- **Context post**: artisan-at-work, process, macro detail of an item
  already shown, customer/event/team/atmosphere shot. Skipped from the
  catalog; image kept for hero photography or atmosphere bands.

Write `POSTS.md` at the repo root with one row per post:

```
| URL | Classification | Reason |
|-----|----------------|--------|
| https://instagram.com/p/abc | Showcase | Filigree pendant, clean background |
| https://instagram.com/p/def | Context | Artisan hands at work |
```

**Soft floor:** if fewer than 6 posts survive as Showcase, fall back to
including macro/detail variants of existing items, or surface the
shortfall to the operator before seeding.

Pause and let the operator review/override the classifications before
proceeding to step 5.

### 5. Extract palette from the profile picture

Inspect the profile picture image. Identify 3–5 swatches that capture
the brand's visual character — a primary, a secondary accent, a warm
ground, a card/parchment tone, and one deeper-band tone. Translate to
hex.

For `heritage-artisan` the role mapping is fixed:

- **primary** → `--primary` (the statesman pole; dardania's navy)
- **gold accent** → `--gold` (the character pole)
- **ground** → `--background` (warm cream, not white)
- **card** → `--card` (a hair off white, lifted above ground)
- **surface band** → `--surface-band` (one step deeper than ground)

If the profile pic is monochrome or too sparse for 5 swatches, fall back
to the dardania defaults for the empty roles and tell the operator
which roles were defaulted.

### 6. Rewrite the slot files

Rewrite each of these with the new brand's values. Do not edit other
files unless something is genuinely broken.

**`brand.config.ts`**
- `name`, `location`, `fullName` — from the IG display name (split if it
  contains a city)
- `tagline` — one short evocative sentence derived from the bio
- `emailDomain` — slug of the brand name, e.g. `petras-filigree.com`
- `meta.title`, `meta.titleTemplate`, `meta.description` — SEO copy in
  English
- `hero.src` — keep `/products/gjakova-carshia-pano.jpg` *only* if the
  brand is also Gjakovë-based; otherwise replace with the path of the
  best Context post image you'll download in step 7, and set
  `hero.alt` to describe it
- `archetype` — leave as `"heritage-artisan"`

**`app/globals.css`**
- Update the `@theme` palette tokens to the swatches from step 5. Both
  the light and the dark blocks.

**`messages/sq.json` and `messages/en.json`**
- Both files, same key paths. Update at minimum:
  - `hero.badge`, `hero.title`, `hero.subtitle`, `hero.ctaExplore`,
    `hero.ctaWishlist`
  - any footer/about copy that names the brand
- Leave universal UI strings (`common.*`, `nav.*`, `cart.*`, etc.) alone.

**`prisma/seed.ts`**
- Replace `CATEGORIES` with brand-appropriate categories (3–6 of them).
- Replace `BRANDS` with brand-appropriate brand names (often just the
  storefront's own name + maybe an artisan family name).
- Replace the products array with one row per Showcase post:
  - `title`, `titleEn` — from your generated copy
  - `description`, `descriptionEn` — 1–2 sentences, in voice
  - `price` — pick a believable price in EUR
  - `thumbnail` — path under `/products/` (step 7 downloads the file)
  - `images` — array with the thumbnail plus any extra angles
  - `category`, `brand` — match a category you defined above
- Leave the demo + admin user upsert blocks alone; they read from
  `brand.emailDomain` automatically.

**`CONTEXT.md`** (the root one — *not* `docs/meta/CONTEXT.md`)
- Rewrite as a domain glossary for the new brand: their voice, their
  color roles, their visual mechanisms, their relationships. Use
  dardania's CONTEXT.md as a template, replacing every term that's
  brand-specific. **Keep the file as a glossary, not a spec.**

**`README.md`**
- Update the `# <Brand>` title, the tagline blockquote, the demo
  account table emails (which now use the new domain), and the
  "Getting started" `git clone` URL. Leave everything else.

### 7. Download IG images into `public/`

For each Showcase post, download the image into
`public/products/<slug>.jpg`. For each Context post you intend to use
(usually 1–3 for hero / about), download into `public/heritage/<slug>.jpg`.

Use `WebFetch` to download. **Do not commit binary uploads as
base64-text** — they must land on disk as real files.

### 8. Verify

Run, in order:

1. `pnpm install` (only if `node_modules` is missing — usually skip)
2. `pnpm db:reset --force` (destructive — only when there's nothing to
   keep, which is true for a fresh scaffold)
3. `pnpm db:migrate`
4. `pnpm db:seed`
5. `pnpm run typecheck && pnpm run lint && pnpm run build`
6. `pnpm dev`

If any of typecheck/lint/build fails, fix it before handing back to the
operator. Common breakages: wrong import path, JSON parse error in
messages, Prisma seed referencing a category/brand name you didn't
declare.

### 9. Hand back

Report to the operator in under 200 words:

- The archetype you used (always `heritage-artisan` day-one)
- The chosen palette swatches (5 hex codes with role labels)
- How many Showcase posts seeded the catalog
- The localhost URL to open
- Anything you defaulted because the IG data was incomplete

## Hard rules

- **Never invent posts or images.** If IG won't load, ask the operator.
- **Never edit files outside the slot list in step 6**, except to fix a
  real build/lint failure surfaced by step 8.
- **Never commit the scaffold's output** — the operator decides what to
  do with the result.
- **Never run `gh repo create`** — the operator handles repo lifecycle.
- **Always classify before downloading.** Downloading every post and
  then sorting is wasteful and pollutes `public/`.
- **The `POSTS.md` checkpoint is mandatory.** Don't skip it even if the
  classification feels obvious — the operator's veto is the safety
  valve.
