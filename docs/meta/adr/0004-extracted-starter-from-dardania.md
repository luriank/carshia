# 0004 — Boilerplate repo is an extracted starter from dardania, marked as a GitHub template repository

Date: 2026-05-25
Status: Accepted

## Context

The boilerplate needs a GitHub repo of its own. Three ways to seed it
relative to dardania:

1. **Fork dardania.** Implies divergent development of the same product.
   Suggests merges back and forth. Wrong shape: dardania is one specific
   storefront, the boilerplate is a generator of storefronts.
2. **Fresh new repo, written from scratch.** Discards dardania's Next.js
   + Prisma + Auth.js + i18n + motion + search + animation-rules + Server
   Action patterns — all of which are good and don't need re-inventing.
3. **Extract a starter.** Copy dardania's files into a new repo, strip the
   Autentika-specific brand layer into named **Slots**, commit that as
   the new repo's initial commit. dardania continues as its own
   specific-storefront product; the new repo evolves independently.

## Decision

Option 3 — extract a starter. The new repo is created from a clean copy
of dardania's `main` (after the Stripe-payments work lands), with the
brand-specific layer removed and replaced by Slots. The new repo is then
marked as a **GitHub template repository** so users can click
"Use this template" to spawn a new project from it — instead of cloning.

## Consequences

- dardania stays as a working, deployed reference storefront. The
  boilerplate is its own product with its own roadmap.
- No merge relationship between the two repos. Bugfixes or improvements
  cross-pollinate manually (cherry-pick or copy-paste), which is fine
  given how rarely they'll need to.
- The new repo's first commit captures "current dardania, brand layer
  removed, slots wired" — a clean, reviewable starting point.
- Marking it a GitHub template repo means the consumption pattern is
  *Use this template → new repo → clone → run scaffold*. Not git clone
  → strip git history → run scaffold. The template-repo button is a
  zero-effort onboarding aid.
- **Timing:** the extraction happens *after* the Stripe-payments work
  on dardania lands on `main`, so the starter inherits Stripe support.
  Doing it now (from pre-Stripe `main`) would mean back-porting Stripe
  later — pointless churn.
- **Naming TBD.** Working name: `çarshia` (Albanian for "bazaar") or
  similar. Final name resolved when the repo is created.
