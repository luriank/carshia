# 0001 — Scaffolding runs as a Claude Code skill, not a CLI

Date: 2026-05-25
Status: Accepted

## Context

The boilerplate needs a step that takes an Instagram handle and produces a
populated storefront — palette tokens, wordmark, copy, seed products, brand
voice. Two ways to ship that step:

1. **Standalone CLI** — `npx create-ig-storefront @handle` runs end-to-end
   with no human in the loop. The IG fetch is a script, the
   "research what they do" step is a call to an LLM API, the palette
   extraction is a library call, the copywriting is a templated prompt.

2. **Claude-in-session skill** — `/scaffold-storefront @handle` runs inside
   a Claude Code session. The model does the IG fetch via `WebFetch`, the
   research via `WebSearch` + native multimodal inspection of profile
   images, and the parameterization by writing files directly.

## Decision

Ship as a Claude Code skill. The boilerplate repo contains the template
plus a `.claude/skills/scaffold-storefront/` skill spec; there is no CLI
binary, no API server, no scraping infrastructure.

## Consequences

- No API keys, no LLM-API budget, no scraping infra. Scaffolding is a
  conversation, not a hosted pipeline.
- Instagram's anti-scraping defenses become recoverable failures: when
  `WebFetch` is blocked, the skill asks the operator to paste the profile
  page HTML or post URLs. A CLI would just break.
- The "research what they do" step (classifying the brand into an
  **Archetype**, picking the palette, writing tasteful sq/en copy) is a
  model task, not a script. Output quality scales with the model.
- Each new storefront is one human-supervised Claude Code session — by
  design, not as a limitation.
- **Trade-off:** scaffolding is not unattended. If bulk scaffolding ever
  becomes a requirement (dozens of storefronts/day), this needs revisiting
  — paid scraping (Apify) + LLM API + queue worker would be the upgrade
  path. For a portfolio/demo generator and per-client bespoke work, this
  isn't a real constraint.
