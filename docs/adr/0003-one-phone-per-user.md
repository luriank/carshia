# One phone per user, not per address

The customer profile and the address book both ask the user for a phone
number. Today the schema reflects that literally: `User` has no phone column
and every `Address` carries its own. We're consolidating to a single
`User.phone` and dropping `Address.phone`. The same number is used for order
status updates and as the courier contact for every address.

## Considered options

- **Per-address phone (status quo).** Most off-the-shelf e-commerce schemas
  model phone on the address, on the theory that a gift shipped to Mom in
  Prishtinë should reach the courier through Mom's number, not the buyer's
  German one. Correct for a real store; in this demo the cost (a second
  phone field on every address dialog, plus the "is this number for orders
  or for delivery?" mental model the user has to maintain) outweighed the
  benefit.
- **Single phone on `User`, no fallback.** The chosen path. Phone moves to
  the account-details form. The courier always calls the buyer regardless
  of which address received the order. Gift-shipment edge case is
  intentionally degraded for simplicity.
- **`User.phone` *and* `Address.phone`, prefilled from the user.** Hybrid:
  account phone fills the address dialog's phone field on creation; the
  user can override per address. Rejected because it reintroduces the
  per-address field we wanted to drop, and the "do I need to fill this?"
  question persists.

## Consequences

- `User.phone String?` added; `Address.phone` dropped. The migration
  backfills `User.phone` from each user's first address (`SELECT phone FROM
  "Address" WHERE userId = u.id ORDER BY "createdAt" ASC LIMIT 1`) before
  the column is removed, so no user loses their existing number.
- `Order.addressJson` (the shipping-time snapshot) still records phone, but
  the value now comes from `user.phone` at place-order time. Old orders
  retain whatever phone was snapshotted on them — no historical rewrite.
- The profile glossary in [CONTEXT.md] picks up an **Account phone** entry
  defining the canonical term and explicitly warning future contributors
  away from "Recipient phone" / "Address phone".
- The address dialog loses the Phone field — one fewer thing to validate,
  one fewer thing for the user to think about.
- Reversibility is poor: re-introducing per-address phone later means a new
  column with no historical data and a UX migration. We accept that cost
  for the demo-quality scope.

[CONTEXT.md]: ../../CONTEXT.md
