export function formatPrice(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

/** Final price after applying the product's discount percentage. */
export function discountedPrice(
  price: number,
  discountPercentage: number,
): number {
  if (!discountPercentage) return round2(price);
  return round2(price * (1 - discountPercentage / 100));
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export const SHIPPING_FLAT = 9.99;
export const FREE_SHIPPING_THRESHOLD = 75;
export const TAX_RATE = 0.08;

export function computeTotals(subtotal: number) {
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const tax = round2(subtotal * TAX_RATE);
  const total = round2(subtotal + shipping + tax);
  return { subtotal: round2(subtotal), shipping, tax, total };
}
