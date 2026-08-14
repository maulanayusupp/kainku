import { defineStore } from 'pinia'
import {
  buildOrderReference,
  calculateTotals,
  normalizeMeters,
  resolveLines,
} from '~/services/cart.service'
import { getProductById } from '~/services/product.service'
import type { CartLine, CheckoutDraft, PlacedOrder, PaymentMethodId, ShippingMethodId } from '~/types/cart'
import type { Product } from '~/types/product'
import { STORAGE_KEYS, readStorage, removeStorage, writeStorage } from '~/utils/storage'

/**
 * The basket.
 *
 * Persisted to localStorage so a refresh does not lose the order. Persistence
 * is deliberately explicit (`hydrate()` from a client-only plugin) rather than
 * automatic, because reading storage during SSR would produce a server render
 * that disagrees with the client and trigger a hydration mismatch.
 */
export const useCartStore = defineStore('cart', {
  state: () => ({
    lines: [] as CartLine[],
    shippingMethod: null as ShippingMethodId | null,
    paymentMethod: 'transfer' as PaymentMethodId,
    /** Set once `hydrate()` has run, so the UI can avoid flashing an empty cart. */
    isReady: false,
    /** Drawer visibility lives here so any component can open it. */
    isDrawerOpen: false,
    lastOrder: null as PlacedOrder | null,
  }),

  getters: {
    resolvedLines: (state) => resolveLines(state.lines, getProductById),

    totals(): ReturnType<typeof calculateTotals> {
      return calculateTotals(this.resolvedLines, this.shippingMethod)
    },

    /** Distinct products in the basket — what the header badge counts. */
    itemCount: (state) => state.lines.length,

    isEmpty: (state) => state.lines.length === 0,

    /** Metres of a given product already in the basket. */
    metersFor:
      (state) =>
      (productId: string): number =>
        state.lines.find((line) => line.productId === productId)?.meters ?? 0,

    has:
      (state) =>
      (productId: string): boolean =>
        state.lines.some((line) => line.productId === productId),
  },

  actions: {
    /** Reads persisted state. Call once, from a client-only plugin. */
    hydrate() {
      const saved = readStorage<{
        lines: CartLine[]
        shippingMethod: ShippingMethodId | null
        paymentMethod: PaymentMethodId
      } | null>(STORAGE_KEYS.cart, null)

      if (saved) {
        // Drop lines whose product has since left the catalogue, and re-snap
        // quantities in case the product's step or stock changed.
        this.lines = saved.lines.flatMap((line) => {
          const product = getProductById(line.productId)
          if (!product) return []
          return [{ ...line, meters: normalizeMeters(product, line.meters) }]
        })
        this.shippingMethod = saved.shippingMethod ?? null
        this.paymentMethod = saved.paymentMethod ?? 'transfer'
      }

      this.lastOrder = readStorage<PlacedOrder | null>(STORAGE_KEYS.lastOrder, null)
      this.isReady = true
    },

    persist() {
      writeStorage(STORAGE_KEYS.cart, {
        lines: this.lines,
        shippingMethod: this.shippingMethod,
        paymentMethod: this.paymentMethod,
      })
    },

    /**
     * Adds metres of a product, merging into an existing line if there is one.
     * Returns the quantity actually added after snapping to stock and step.
     */
    add(product: Product, meters = product.minOrderMeters): number {
      if (product.stockMeters <= 0) return 0

      const existing = this.lines.find((line) => line.productId === product.id)
      const target = normalizeMeters(product, (existing?.meters ?? 0) + meters)

      if (existing) {
        existing.meters = target
        existing.unitPrice = product.pricePerMeter
      } else {
        this.lines.push({
          productId: product.id,
          slug: product.slug,
          meters: target,
          unitPrice: product.pricePerMeter,
        })
      }

      this.persist()
      return target
    },

    /** Sets an exact quantity. Passing `0` or less removes the line. */
    setMeters(productId: string, meters: number) {
      const line = this.lines.find((entry) => entry.productId === productId)
      const product = getProductById(productId)
      if (!line || !product) return

      if (meters <= 0) {
        this.remove(productId)
        return
      }

      line.meters = normalizeMeters(product, meters)
      this.persist()
    },

    increment(productId: string) {
      const product = getProductById(productId)
      if (!product) return
      this.setMeters(productId, this.metersFor(productId) + product.stepMeters)
    },

    decrement(productId: string) {
      const product = getProductById(productId)
      if (!product) return
      const next = this.metersFor(productId) - product.stepMeters
      // Stepping below the minimum removes the line rather than getting stuck.
      this.setMeters(productId, next < product.minOrderMeters ? 0 : next)
    },

    remove(productId: string) {
      this.lines = this.lines.filter((line) => line.productId !== productId)
      this.persist()
    },

    clear() {
      this.lines = []
      this.shippingMethod = null
      this.persist()
    },

    setShippingMethod(method: ShippingMethodId) {
      this.shippingMethod = method
      this.persist()
    },

    setPaymentMethod(method: PaymentMethodId) {
      this.paymentMethod = method
      this.persist()
    },

    openDrawer() {
      this.isDrawerOpen = true
    },

    closeDrawer() {
      this.isDrawerOpen = false
    },

    /**
     * Records the order locally and empties the basket.
     *
     * NOTE: this does not take payment and does not reserve stock. It exists so
     * the checkout flow has a realistic end state. Wiring a real payment
     * gateway is tracked in TODO.md.
     */
    placeOrder(draft: CheckoutDraft): PlacedOrder {
      const order: PlacedOrder = {
        reference: buildOrderReference(),
        placedAt: new Date().toISOString(),
        lines: [...this.lines],
        totals: this.totals,
        customer: { ...draft.customer },
        shippingMethod: draft.shippingMethod,
        paymentMethod: draft.paymentMethod,
      }

      this.lastOrder = order
      writeStorage(STORAGE_KEYS.lastOrder, order)
      this.lines = []
      this.shippingMethod = null
      this.persist()
      removeStorage(STORAGE_KEYS.checkout)

      return order
    },
  },
})
