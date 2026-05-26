# 0003 — IG posts are classified into showcase vs context; only showcases seed the catalog

Date: 2026-05-25
Status: Accepted

## Context

An active Instagram account has heterogeneous posts. For `heritage-artisan`
specifically: item-focused hero shots are products, but artisan-at-work
shots, customer photos, event shots, and macro details are not. If the
**Scaffold session** turns every post into a Product row, the resulting
catalog mixes 60% real products with 40% atmosphere shots, which looks
amateurish on first render and undermines the "ready to ship" promise.

Three ways to handle this:

1. **All posts in.** Every post → one Product. Simplest seed step.
2. **First-N, no filter.** Take latest N posts, assume representative.
3. **Per-post classification by the session, with per-archetype hints.**
   Session inspects each post (image + caption), classifies as showcase or
   context using rules the archetype provides; only showcases seed the
   catalog.

## Decision

Option 3. Two domain terms:

- **Showcase post** — IG post classified as a product, lookbook entry, or
  menu item (archetype-dependent). Seeds the catalog.
- **Context post** — IG post classified as non-product (atmosphere,
  process, team, event). Skipped from the catalog but its image may be
  used in non-catalog slots — hero photography, the artisan-story band,
  the about page.

The session writes a `POSTS.md` checkpoint listing every fetched post with
its classification + a one-line reason. The operator can override before
seeding.

## Consequences

- Per-archetype classification rules live in the archetype spec, alongside
  design tokens and brand-voice templates. `heritage-artisan` defines what
  counts as a showcase for an artisan brand; `warm-bistro` will define its
  own rules when shipped.
- The single highest-risk model judgment of a **Scaffold session** is the
  per-post classification. The `POSTS.md` checkpoint is the auditable
  artifact; the operator's review is the safety valve.
- **Soft floor:** if fewer than ~6 showcase posts survive filtering, the
  session falls back to including detail/macro variants of existing items,
  or asks the operator. This is a skill-level rule, not an archetype rule
  — every archetype inherits it.
- **Context posts are not garbage** — they feed hero photography and the
  brand-voice narrative band. The classification is *catalog-eligible* vs
  *atmosphere-only*, not *keep* vs *throw*.
- **Trade-off:** more per-post work during a session, but the resulting
  catalog renders cleanly. The trade is worth it because a polluted
  catalog is the most visible day-one failure mode.
