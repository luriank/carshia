# Adopt Phosphor duotone (Navy + Gold) as the icon system

The header chrome was running on `lucide-react` line icons with per-action
rainbow accents — rose heart for wishlist, indigo/amber moon/sun on the
theme toggle, violet/emerald/sky inside the account menu. Held up against
the [CONTEXT.md] criterion *"does this make the **Heritage Gjakovë voice**
stronger or louder?"*, the rainbow palette was actively fighting the
**Navy** / **Gold** / **Cream** pillars — it read as generic SaaS chrome,
not as part of the same composition as the wordmark.

## Considered options

- **Stay on Lucide, just restyle (kill the rainbow).** Cheapest path — bump
  stroke weight, recolor everything to `text-foreground` / `text-primary`.
  Removes the actual voice fight but leaves a generic line-icon
  vocabulary that could appear on any e-commerce template; doesn't carry
  any heritage signal of its own.
- **Phosphor regular (line, not duotone) everywhere.** A consistent stroke
  weight across all icons, slightly more crafted than Lucide. Solves the
  rainbow problem and refreshes the vocabulary, but the icons are still a
  single tone — no brand reinforcement on every action.
- **Surgical (header + brand surfaces only).** Swap ~6 high-signal files
  to a new vocabulary; leave admin, product, cart pages on Lucide. Low
  blast radius but produces a split-personality icon vocabulary across
  the app — Lucide and Phosphor side by side in adjacent components.
- **Custom hand-drawn SVG set.** Strongest possible heritage signal
  (literal Çarshia lantern, etc.). Rejected on scope — drawing and
  maintaining ~40 production-quality icons is a separate project.
- **Phosphor duotone everywhere, driven by Navy + Gold.** The chosen path.
  Every icon renders as a navy silhouette with a gold-tinted accent
  (Phosphor's secondary duotone path). The pair mirrors the wordmark
  composition — navy "Autentika" + gold dot — and repeats it on every
  interaction. Sun glyph in the theme toggle is the one documented
  inversion (gold-led with navy accent) so day/night still reads in
  colour, not just shape.

## Consequences

- `@phosphor-icons/react` joins `dependencies`; `lucide-react` is removed.
  Bundle impact is comparable — both libraries tree-shake per icon.
- ~80 files across `app/`, `components/`, `lib/` have their icon imports
  swapped, with name remaps (`Search → MagnifyingGlass`,
  `Trash2 → Trash`, `ChevronLeft → CaretLeft`, `LayoutDashboard →
  SquaresFour`, `LogOut → SignOut`, `Loader2 → CircleNotch`,
  `Sparkles → Sparkle`, `Mail → Envelope`, `Home → House`, …).
- The navy+gold pairing is driven by a **single CSS rule** in
  [`app/globals.css`](../../app/globals.css) targeting Phosphor's
  duotone secondary path (`svg[viewBox="0 0 256 256"] path[opacity="0.2"]`).
  Re-tuning the gold accent — or swapping to a different secondary
  colour — is a one-line change, not 80.
- Per-icon semantic colour is intentionally lost. The wishlist heart no
  longer reads "red" in its own right; it reads "navy with gold accent"
  like every other action. Wishlist-ness is carried by the icon shape
  alone. Same trade for the theme-toggle moon (was indigo) and every
  account-menu item (was violet/emerald/sky).
- Dense surfaces accept a busier visual. Chevrons, plus/minus,
  loaders, X close glyphs render duotone too, which means a faint gold
  ghost on each. Acceptable because the alternative (mixed
  weights/libraries in one app) is the worse failure mode the
  *"surgical"* option produced.
- Counters (cart count, wishlist count) converge on the **Action mark** —
  open gold ring + navy tabular numeral, defined as a Badge variant in
  [`components/ui/badge.tsx`](../../components/ui/badge.tsx) and consumed
  by [`wishlist-nav-button.tsx`](../../components/layout/wishlist-nav-button.tsx)
  and [`cart-sheet.tsx`](../../components/cart/cart-sheet.tsx). The two
  were previously inconsistent (one was solid gold pip, the other was
  solid navy pill).
- Reversibility is medium-high. The dependency swap and the CSS rule are
  trivial to undo; rolling back the 80-file sweep means another mechanical
  rename pass. The new glossary terms in [CONTEXT.md] (**Duotone
  signature**, **Action mark**) would also need to be removed.

[CONTEXT.md]: ../../CONTEXT.md
