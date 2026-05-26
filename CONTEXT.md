# Autentika Gjakovë

A bilingual (sq default, en) Kosovar artisan storefront. The visual identity is
the product, not a chrome on top of one — it ties the catalog to the city of
Gjakovë and its Çarshia e Madhe (Grand Bazaar) heritage.

## Language

### Brand voice

**Heritage Gjakovë voice**:
The visual+narrative system that frames the storefront as a contemporary
showcase of artisan goods rooted in Gjakovë's old bazaar. Concretely: navy +
gold + warm cream palette, Cormorant Garamond display serif, Çarshia hero
photography, the "Autentika · Gjakovë" wordmark, and the artisan-story band on
the homepage.
_Avoid_: "Branding", "theme", "skin" (all imply replaceable surface).

**Modernize-within-voice**:
The active design direction: deepen, sharpen, and differentiate *inside* the
Heritage Gjakovë voice rather than replacing it. Trade-offs around color,
contrast, surface depth, and motion get resolved by asking "does this make the
voice stronger or louder?", not "does this look more current?".
_Avoid_: "Redesign" (suggests starting over), "rebrand" (suggests new voice).

### Color roles

**Navy** (`--primary`):
The structural brand color. Used for CTAs, focus rings, link hover, and
discount badges. Acts as the "statesman" / authority pole of the palette.
_Avoid_: "Blue" (under-specifies — sky/cobalt/teal would all break the voice).

**Gold** (`--gold`):
The character accent and brand-recognition pole — the visible "this is
Autentika" signal. Used for: gilt rules, hover halos, eyebrow dots,
bestseller pills, rating stars, wordmark dot, trust-marquee icons. Carries
the artisan/brass/copper association.
_Avoid_: "Yellow", "amber" (yellow reads cheap; amber reads warning).

**Cream** (`--background`):
The warm ground tone, deep enough that **Card** can lift above it. Not white.
Distinguishes the site from generic slate/zinc/white SaaS surfaces.
_Avoid_: "White", "off-white" (both lose the warmth signal).

**Card** (`--card`):
The "parchment" surface — a hair off white, deliberately lighter than
**Cream** so a card on the page reads as a lifted object, not a bordered
region. Used for product cards, sidebar, popovers, the artisan-story band.
_Avoid_: "Panel", "tile" (lose the parchment metaphor).

**Surface band** (`--surface-band`):
A one-step-deeper Cream tone used to mark a horizontal "band" of the page —
bestsellers, trust marquee, and any future curated-content block. The
mechanism for **Section rhythm**.
_Avoid_: "Stripe", "section bg" (under-specifies what it's for).

### Visual mechanisms

**Gilt rule**:
A short, soft horizontal gold gradient line placed above or below a section
heading. The dominant typographic divider — every hero-class h2/h1 gets one.
Implemented as the `gilt-rule` Tailwind utility in `app/globals.css`.
_Avoid_: "Underline", "divider" (both imply uniform line; gilt-rule is
specifically the gold gradient).

**Section rhythm**:
The alternation between **Cream** and **Surface band** tones (and the
**Card** parchment surfaces above them) as the eye scrolls. Each major
section sits on one of three planes. Without rhythm the page reads flat
even if every component is correct.
_Avoid_: "Vertical spacing" (rhythm is about *tone alternation*, not gap).

**Lamplit-bazaar dark**:
The dark-mode flavor: warmer, deeper ground with brass-tinted gold and
inkier navy. The intent is "bazaar by lamp" rather than "neutral inverted
light".
_Avoid_: "Dark theme" (under-specifies — generic dark would break the voice).

**Duotone signature**:
The navy + gold two-tone treatment applied to every icon in the action
chrome (nav, account menu, cart sheet, product actions, footer, admin).
Navy carries the silhouette (primary path); gold reads as a brand-tinted
accent (the duotone secondary path). Mirrors the wordmark composition —
navy "Autentika" + gold dot — at icon scale. The Sun glyph in the theme
toggle is the one documented inversion: gold-led with a navy accent, to
preserve the day/night colour cue.
_Avoid_: "Icon style", "icon theme" (under-specify — duotone signature
is specifically the navy+gold path-pair, not a stroke/weight choice).

**Action mark**:
A small open gold ring with a navy tabular numeral inside, used for
counters on action icons (cart count, wishlist count, future notification
dots). The ring echoes the gilt-rule at icon scale; the numeral keeps
legibility at ≈18 px where Cormorant would go hairline. One style across
wishlist and cart — they were previously inconsistent (wishlist was
solid gold pip, cart was solid navy pill).
_Avoid_: "Counter badge", "notification dot" (under-specify — action mark
is specifically the open gold ring + navy tabular numeral, not a filled
pill).

## Customer domain

**Account phone**:
The single phone number stored on the User. Used for order-status updates
and as the courier contact for every delivery, regardless of which address
the order ships to. There is intentionally no per-address phone.
_Avoid_: "Recipient phone" or "Address phone" (both imply per-address —
we deliberately rejected that model, see ADR 0003).

**Default address**:
The one address a user has marked as their primary delivery point. The
checkout pre-selects it; the manager card shows a "Parazgjedhur" /
"Default" badge on it. Exactly one per user is enforced at the database
level by a Postgres partial unique index on `(userId) WHERE "isDefault"`.
The user's first-ever address is automatically the default.
_Avoid_: "Primary address" (used informally for "the first one added";
under-specifies whether it's actively chosen).

**Komuna**:
Albanian for *municipality* — Kosovo's sub-national administrative unit
(38 of them: Gjakovë, Prishtinë, Prizren, Pejë, …). Note: the address
form deliberately does **not** ask for a komuna; for Kosovo-only scope,
city + postal code already identifies a delivery uniquely. The term is
recorded here so that if a region field is ever reintroduced, it is
labeled "Komuna" (sq) / "Municipality" (en) — never "Shteti", which in
Albanian means *country/state* (nation-state), not municipality.
_Avoid_: "State" or "Shteti" for sub-national region (the latter is a
false friend that the pre-redesign address form fell into).

## Relationships

- The **Heritage Gjakovë voice** is composed of {**Navy**, **Gold**, **Cream**,
  **Card**, **Surface band**} + Cormorant serif + Çarshia photography + the
  artisan-story narrative band. Removing any pillar weakens the voice.
- **Section rhythm** is the alternation pattern between **Cream**,
  **Card**, and **Surface band**. Each major page section lives on exactly
  one of these planes.
- **Gilt rule** belongs above/below every hero-class heading — bestsellers,
  artisan story, catalog header. It is the typographic signature of the
  **Heritage Gjakovë voice**.
- **Modernize-within-voice** constrains every design decision in this project:
  changes are evaluated against whether they sharpen the voice, not whether
  they follow a current trend.
- **Lamplit-bazaar dark** is the dark-mode mirror of the same composition —
  same pillars, different light source.
- **Duotone signature** and **Action mark** are the icon-scale extensions
  of the **Heritage Gjakovë voice** — same navy+gold pair, applied to
  every action. They depend on **Navy** and **Gold** as roles; removing
  either would collapse the duotone to a single tone and weaken the voice.

## Example dialogue

> **Designer:** "Let's swap navy for a softer denim — feels more modern."
> **PM:** "Denim breaks the **Heritage Gjakovë voice** — `#1b3a6b` is the
> Albanian-flag navy, and dropping it cuts the statesman pole. If navy reads
> flat, deepen it or add a midtone, don't replace it."

> **Designer:** "The bestseller section feels lost between hero and catalog."
> **PM:** "It's a **Section rhythm** issue — give it a **Surface band** tone
> and a **Gilt rule** above the heading, so it reads as its own plane."

## Flagged ambiguities

_None yet._
