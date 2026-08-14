import { FREE_SHIPPING_METERS, MAX_METERS_PER_LINE, SHIPPING_METHODS } from '~/data/shipping'
import type { CartLine, CartTotals, ResolvedCartLine, ShippingMethodId } from '~/types/cart'
import type { Product } from '~/types/product'
import { clamp, round } from '~/utils/format'

/**
 * Cart arithmetic, kept out of the store so it can be reasoned about and tested
 * in isolation. Everything here is a pure function of its inputs.
 */

/**
 * Snaps a requested quantity to something the product can actually be cut to:
 * at least `minOrderMeters`, on a `stepMeters` boundary, never above stock.
 */
export function normalizeMeters(product: Product, requested: number): number {
  const step = product.stepMeters > 0 ? product.stepMeters : 0.5
  const ceiling = Math.min(
    product.stockMeters > 0 ? product.stockMeters : product.minOrderMeters,
    MAX_METERS_PER_LINE,
  )
  const snapped = Math.round(requested / step) * step
  return round(clamp(snapped, product.minOrderMeters, Math.max(ceiling, product.minOrderMeters)), 2)
}

/** Joins raw cart lines with their product records, dropping any orphans. */
export function resolveLines(
  lines: CartLine[],
  lookup: (productId: string) => Product | undefined,
): ResolvedCartLine[] {
  return lines.flatMap((line) => {
    const product = lookup(line.productId)
    if (!product) return []
    return [{ ...line, product, lineTotal: round(line.unitPrice * line.meters, 0) }]
  })
}

/**
 * Computes order totals.
 *
 * @param lines    Resolved cart lines.
 * @param shipping Selected method, or `null` before the customer has chosen —
 *                 in which case `totals.shipping` stays `null` and the UI shows
 *                 "calculated at checkout" rather than implying it is free.
 */
export function calculateTotals(
  lines: ResolvedCartLine[],
  shipping: ShippingMethodId | null = null,
): CartTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)
  const totalMeters = round(
    lines.reduce((sum, line) => sum + line.meters, 0),
    2,
  )

  const shippingCost = resolveShippingCost(shipping, totalMeters)
  const discount = 0

  return {
    subtotal,
    discount,
    shipping: shippingCost,
    totalMeters,
    grandTotal: Math.max(0, subtotal - discount + (shippingCost ?? 0)),
  }
}

/** `null` until a method is chosen; `0` only when the service is genuinely free. */
export function resolveShippingCost(
  method: ShippingMethodId | null,
  totalMeters: number,
): number | null {
  if (!method) return null
  const found = SHIPPING_METHODS.find((entry) => entry.id === method)
  if (!found) return null
  if (found.id === 'regular' && totalMeters >= FREE_SHIPPING_METERS) return 0
  return found.price
}

/** Metres still needed to reach the free-shipping threshold; `0` once met. */
export function metersToFreeShipping(totalMeters: number): number {
  return round(Math.max(0, FREE_SHIPPING_METERS - totalMeters), 2)
}

/**
 * Builds a human-quotable order reference, e.g. `KK-260814-4F2A`.
 * Not cryptographically unique — a real backend must issue the authoritative
 * number. This exists so the demo confirmation screen has something to show.
 */
export function buildOrderReference(now: Date = new Date()): string {
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0')
  return `KK-${yy}${mm}${dd}-${random}`
}

export { FREE_SHIPPING_METERS, SHIPPING_METHODS }
