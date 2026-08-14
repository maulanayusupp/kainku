import type { Product } from './product'

/** One line in the basket. Quantity is in metres and may be fractional. */
export interface CartLine {
  productId: string
  slug: string
  /** Metres ordered. Always a multiple of the product's `stepMeters`. */
  meters: number
  /** Unit price captured when the line was added, so totals stay stable. */
  unitPrice: number
}

/** A cart line joined with its product record for rendering. */
export interface ResolvedCartLine extends CartLine {
  product: Product
  lineTotal: number
}

export interface CartTotals {
  /** Sum of all line totals, before discount and shipping. */
  subtotal: number
  /** Positive number to subtract from the subtotal. */
  discount: number
  /** `null` means "calculated at the next step" rather than "free". */
  shipping: number | null
  /** Total metres across all lines — drives the free-shipping threshold. */
  totalMeters: number
  /** subtotal - discount + (shipping ?? 0) */
  grandTotal: number
}

export type ShippingMethodId = 'regular' | 'kargo' | 'pickup'

export interface ShippingMethod {
  id: ShippingMethodId
  /** Flat rate in IDR. `0` is genuinely free (store pickup). */
  price: number
  /** Estimated transit window in working days. */
  etaDaysMin: number
  etaDaysMax: number
}

export type PaymentMethodId = 'transfer' | 'va' | 'ewallet' | 'cod'

export interface CheckoutCustomer {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  notes: string
}

export interface CheckoutDraft {
  customer: CheckoutCustomer
  shippingMethod: ShippingMethodId
  paymentMethod: PaymentMethodId
  agreedToTerms: boolean
}

export interface PlacedOrder {
  reference: string
  placedAt: string
  lines: CartLine[]
  totals: CartTotals
  customer: CheckoutCustomer
  shippingMethod: ShippingMethodId
  paymentMethod: PaymentMethodId
}
