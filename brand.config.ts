/**
 * Brand configuration — the single source of truth for the storefront's
 * identity.
 *
 * This file is the primary slot rewritten by the `/scaffold-storefront`
 * skill. To re-brand the storefront manually, edit the values here and
 * run `pnpm db:reset && pnpm db:seed`.
 *
 * The values below are the day-one defaults — Autentika Gjakovë, the
 * `heritage-artisan` archetype's reference implementation.
 */

export const brand = {
  /** Display name shown in the wordmark (line 1). */
  name: "Autentika",

  /** Display location shown in the wordmark (line 2 / eyebrow). */
  location: "Gjakovë",

  /** Composed display name — used in metadata, alt text, page titles. */
  fullName: "Autentika Gjakovë",

  /** Short brand tagline — used in the README header and footer. */
  tagline: "Carry a piece of Kosovo home.",

  /** Domain stem for seeded demo and admin accounts. */
  emailDomain: "autentika-gjakove.com",

  /** Open Graph / `<head>` metadata. */
  meta: {
    title: "Autentika Gjakovë — Handmade crafts from the Grand Bazaar",
    titleTemplate: "%s · Autentika Gjakovë",
    description:
      "Autentika Gjakovë — authentic handmade Kosovar crafts from Çarshia e Madhe: filigree silver, traditional wear, copper, kilim, and artisan goods.",
  },

  /** Hero photography for the catalog landing. */
  hero: {
    src: "/products/gjakova-carshia-pano.jpg",
    alt: "Çarshia e Madhe — the Grand Bazaar of Gjakovë",
  },

  /**
   * Visual archetype the storefront's design language belongs to.
   * Day-one the boilerplate ships only `heritage-artisan` — adding new
   * archetypes is a real PR with design review (see
   * `docs/meta/adr/0002-curated-archetypes.md`).
   */
  archetype: "heritage-artisan" as const,
} as const;

export type BrandConfig = typeof brand;
