# 0002 — Design language is picked from a curated archetype library, not invented

Date: 2026-05-25
Status: Accepted

## Context

Each scaffolded storefront should look distinctive — its visual identity
adapted to the brand, not all sharing one frozen design language. The
question is *how* the per-brand design language gets created during a
**Scaffold session**.

1. **Freeform invention** — the session invents typography, palette,
   divider style, surface system, and motion feel from scratch per brand,
   based on the IG vibe. Every storefront is a one-off.

2. **Curated archetype library** — the boilerplate ships ~5–6 hand-crafted
   **Archetypes** (heritage-artisan, modern-minimal, warm-bistro,
   boutique-fashion, streetwear, etc.); the session *picks one* per brand
   and parameterizes within it (re-tints colors, optional typography sister
   swap). The session classifies; it does not invent.

## Decision

Curated archetype library. Each archetype is a real PR with design
iteration; the session's job is classification + parameterization, not
invention.

## Consequences

- Each archetype's design quality is bounded by craft, not by what the
  model invents on the fly. dardania's current "Heritage Gjakovë voice"
  becomes the first archetype (`heritage-artisan`), generalized.
- The session's single highest-risk step becomes **archetype
  classification** — looking at IG profile pic, post grid, and bio, then
  picking best-fit. Wrong classification produces a storefront in the
  wrong voice. The skill spec should require the session to *name* its
  chosen archetype + reasoning back to the operator before filling slots,
  so it can be vetoed early.
- Brands that don't fit any archetype fall back to the closest match. If
  a brand cluster repeatedly needs a missing archetype, that's a signal to
  ship a new archetype — a few days of real design work, not a
  scaffold-time invention.
- **Day-one library:** `heritage-artisan` only (dardania's design language,
  generalized). Other archetypes get added in subsequent PRs as the brands
  that need them appear.
- **Trade-off:** breadth is explicitly traded for quality. Brands whose IG
  vibe clashes with every available archetype just shouldn't use this
  boilerplate.
