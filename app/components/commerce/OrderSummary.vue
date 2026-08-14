<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

/**
 * Totals panel shared by the cart page and checkout.
 *
 * Shipping renders as "calculated at the next step" until a method is chosen —
 * it is never shown as free unless it genuinely is.
 */
withDefaults(
  defineProps<{
    /** Show the per-line mini list (checkout) or hide it (cart page). */
    showLines?: boolean
    title?: string
  }>(),
  { showLines: false, title: undefined },
)

const { t } = useI18n()
const { price, meters } = useFormat()
const cart = useCartStore()
const { localize } = useProductContent()
</script>

<template>
  <section class="summary" :aria-label="title ?? t('cart.summary')">
    <h2 class="summary__title">{{ title ?? t('cart.summary') }}</h2>

    <div v-if="showLines && !cart.isEmpty" class="summary-lines">
      <div
        v-for="line in cart.resolvedLines"
        :key="line.productId"
        class="summary-line"
        :class="`swatch--${line.product.palette}`"
      >
        <span class="summary-line__media">
          <img :src="line.product.images[0]!.src" alt="" width="44" height="59" loading="lazy">
        </span>
        <span>
          <span class="summary-line__name">{{ localize(line.product).name }}</span>
          <span class="summary-line__qty">{{ meters(line.meters) }}</span>
        </span>
        <span class="summary-line__price">{{ price(line.lineTotal) }}</span>
      </div>
    </div>

    <div class="summary__rows">
      <div class="summary__row">
        <span>{{ t('cart.subtotal') }}</span>
        <span class="summary__value">{{ price(cart.totals.subtotal) }}</span>
      </div>

      <div class="summary__row">
        <span>{{ t('cart.totalMeters') }}</span>
        <span class="summary__value">{{ meters(cart.totals.totalMeters) }}</span>
      </div>

      <div class="summary__row">
        <span>{{ t('cart.shipping') }}</span>
        <span v-if="cart.totals.shipping === null" class="summary__value summary__value--muted">
          {{ t('cart.shippingPending') }}
        </span>
        <span v-else-if="cart.totals.shipping === 0" class="summary__value">
          {{ t('cart.free') }}
        </span>
        <span v-else class="summary__value">{{ price(cart.totals.shipping) }}</span>
      </div>
    </div>

    <div class="summary__total">
      <span>{{ t('cart.total') }}</span>
      <span>{{ price(cart.totals.grandTotal) }}</span>
    </div>

    <slot />
  </section>
</template>
