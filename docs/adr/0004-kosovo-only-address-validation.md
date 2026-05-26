# Kosovo-only address validation

The storefront is "Autentika Gjakovë" — the visual language, the photography,
and the catalog all anchor on Gjakovë. We're treating shipping the same
way: the address book validates as Kosovan, the country is implicit, and
the form is tailored to Kosovo's addressing conventions. The diaspora
customer in Zürich can't (today) save a Swiss address.

## Considered options

- **Lenient global validation (status quo).** Free-text country, free-text
  state, `min(5).max(30)` phone, `min(2).max(20)` postal — accepts
  anything that doesn't look empty. Cheap, but lets the user type
  "Gjakovë" into both *city* and *Shteti / rajoni* (the screenshot that
  kicked off this work), produces malformed phone numbers like
  `+38 9 555 1 2 3 abc`, and silently lets you fat-finger the postal
  code.
- **Kosovar-diaspora set (~20 countries) with libphonenumber-js +
  per-country postal regex.** Earlier draft of this plan. Catches errors
  per locale, supports the diaspora story. Rejected because the user's
  storefront is the *Çarshia of Gjakovë*, not an EU-wide marketplace —
  validating 20 countries adds a country dropdown, a `i18n-iso-countries`
  dep, and a postal-code regex map for everything from CH `\d{4}` to
  UK `[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}`. Carrying that complexity for a
  demo that won't ship outside Kosovo is the wrong call.
- **Kosovo-only with `libphonenumber-js` (region `XK`) and a single
  5-digit postal regex.** The chosen path. Country is implicit (set on
  the server, not asked for in the UI). Phone normalizes to E.164
  (`+383…`). Postal must match `^\d{5}$` (Kosovo's range is
  10000–90000 but the simpler regex is sufficient at the input layer).

## Consequences

- `Address.country` and `Address.state` are dropped from the schema. The
  field labeled "Shteti / rajoni" in `sq` was using the wrong word
  anyway — *Shteti* means *country/state* (nation-state), not
  municipality. The right Kosovan term is **Komuna**, captured in the
  [CONTEXT.md] glossary so the trap doesn't get re-set if a region field
  is ever reintroduced.
- The address dialog shrinks to: full name, street, city + postal,
  label. One row fewer, no country dropdown, no fuzzy region field.
- `libphonenumber-js` joins `dependencies` but lives **server-side only**
  — imported by `lib/actions/profile.ts`, not by `lib/validations/profile.ts`.
  The client form ships a small structural regex (`^[+\d][\d\s-]{5,19}$`)
  for instant feedback on shape; the authoritative `XK` parse runs in the
  server action on submit. Keeps the country-metadata blob (~80 KB raw,
  ~25 KB gzipped) off the `/profile` route's client bundle. Trade-off:
  invalid-but-shape-OK numbers (e.g. `+38312345678`, wrong national prefix)
  only surface their error after submit, as a toast instead of an inline
  field error.
- `Order.addressJson` retains whatever was snapshotted at place-order
  time — old orders with non-Kosovan or free-text country/state survive.
  Going forward, the snapshot includes `country: "Kosovo"` as a constant.
- Reversibility is medium: removing the validation is trivial, but
  recovering historical *state* / *country* per-user is impossible
  (column dropped). If international shipping ever becomes a real
  requirement, it'll be a fresh design pass — country dropdown,
  per-country validation tables, and the per-address phone question
  re-opened (see [ADR 0003][adr-0003]).

[CONTEXT.md]: ../../CONTEXT.md
[adr-0003]: ./0003-one-phone-per-user.md
