/**
 * Presentation helpers. Pure functions only — no Nuxt or Vue imports — so they
 * can be unit-tested and reused on the server.
 */

/**
 * Formats an IDR amount the way Indonesian price lists do: `Rp 685.000`.
 * Fractional rupiah are never shown because the catalogue prices in whole IDR.
 *
 * @param amount Value in rupiah.
 * @param locale BCP-47 tag; only affects digit grouping, never the currency.
 */
export function formatPrice(amount: number, locale = 'id-ID'): string {
  if (!Number.isFinite(amount)) return '—'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Compact form for tight spaces: `Rp 685rb`, `Rp 1,4jt`. */
export function formatPriceCompact(amount: number, locale = 'id-ID'): string {
  if (!Number.isFinite(amount)) return '—'
  const isId = locale.startsWith('id')
  if (amount >= 1_000_000) {
    const v = round(amount / 1_000_000, 1)
    return `Rp ${formatNumber(v, locale)}${isId ? 'jt' : 'M'}`
  }
  if (amount >= 1000) {
    return `Rp ${formatNumber(Math.round(amount / 1000), locale)}${isId ? 'rb' : 'k'}`
  }
  return formatPrice(amount, locale)
}

/** Locale-aware plain number, e.g. `1.250` (id) or `1,250` (en). */
export function formatNumber(value: number, locale = 'id-ID', maxFractionDigits = 2): string {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat(locale, { maximumFractionDigits: maxFractionDigits }).format(value)
}

/**
 * Formats a metre quantity, keeping the half-metre when there is one:
 * `2 m`, `2,5 m`.
 */
export function formatMeters(meters: number, locale = 'id-ID'): string {
  return `${formatNumber(meters, locale, 2)} m`
}

/** `18 Mei 2026` / `18 May 2026`. */
export function formatDate(input: string | Date, locale = 'id-ID'): string {
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/** Whole-percent saving between a reference price and the selling price. */
export function discountPercent(compareAt: number, price: number): number {
  if (!compareAt || compareAt <= price) return 0
  return Math.round(((compareAt - price) / compareAt) * 100)
}

/** Rounds to a fixed number of decimals without floating-point drift. */
export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}

/** Clamps `value` into the inclusive `[min, max]` range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Truncates on a word boundary and appends an ellipsis when it had to cut. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/** URL-safe slug. Diacritics are stripped, everything else collapses to `-`. */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Initials for avatar placeholders, max two characters. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
