# 0005 — Day-one scope is `heritage-artisan` only; the archetype substrate emerges when archetype #2 lands

Date: 2026-05-25
Status: Accepted

## Context

[ADR 0002](0002-curated-archetypes.md) commits to a curated **Archetype**
library — `heritage-artisan`, `warm-bistro`, `modern-minimal`,
`boutique-fashion`, `streetwear`, etc. The question is *when* the
substrate that makes archetypes pluggable gets built.

1. **Build the substrate now.** Day-one boilerplate ships with
   `template/themes/heritage-artisan/` as one entry in a multi-archetype
   directory layout. Components are written against an abstract theme API
   (CSS variables, slot props). The skill picks `heritage-artisan` by
   default — because it's the only option — but the *machinery* is
   already pluggable.

2. **Generalize later.** Day-one boilerplate ships as
   "dardania, brand-layer in slots" — effectively a heritage-artisan
   storefront with parameterization. No abstract theme API, no
   multi-archetype directory. When archetype #2 (e.g. `warm-bistro`)
   needs to ship, *that* PR builds the substrate, informed by two real
   archetypes instead of one.

## Decision

Option 2 — generalize later. Day-one is `heritage-artisan` baked in.

## Consequences

- Day-one ship is faster — the work is "strip Autentika specifics into
  named slots", not "design an abstract theme substrate".
- The substrate, when built, is informed by two real archetypes — not
  one. Premature abstraction with N=1 example tends to encode the wrong
  shape; two examples give a real differential to abstract over.
- The CONTEXT.md term **Archetype** is forward-looking day-one — it names
  a concept the docs use but the code doesn't have yet. The day-one
  boilerplate ships exactly one archetype, baked in. The docs say so
  honestly.
- The skill's archetype-classification step (per ADR 0002) is still
  written into the skill spec, but day-one it always picks
  `heritage-artisan`. The classification logic stays in the skill for
  when it has real choices to make.
- **Trade-off:** day-one boilerplate is narrower in coverage than the
  long-term vision. Brands that don't fit heritage-artisan shouldn't use
  the day-one version. The archetype library grows when the first real
  mismatch creates pressure to ship archetype #2 — *demand-driven*.
