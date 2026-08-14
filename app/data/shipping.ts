import type { PaymentMethodId, ShippingMethod } from '~/types/cart'

/**
 * SAMPLE DATA — indicative rates for this demonstration build. Real rates are
 * confirmed per order; see /legal/shipping.
 */
export const SHIPPING_METHODS: ShippingMethod[] = [
  { id: 'regular', price: 25000, etaDaysMin: 2, etaDaysMax: 5 },
  { id: 'kargo', price: 45000, etaDaysMin: 4, etaDaysMax: 9 },
  { id: 'pickup', price: 0, etaDaysMin: 0, etaDaysMax: 1 },
]

export const PAYMENT_METHODS: PaymentMethodId[] = ['transfer', 'va', 'ewallet', 'cod']

/** Orders of this many metres or more ship free on the `regular` service. */
export const FREE_SHIPPING_METERS = 10

/** Cart lines are capped so a demo order cannot request an absurd quantity. */
export const MAX_METERS_PER_LINE = 200
