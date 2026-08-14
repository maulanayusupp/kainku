<script setup lang="ts">
import { FREE_SHIPPING_METERS, metersToFreeShipping } from '~/services/cart.service'

/**
 * Progress toward the free-shipping threshold.
 *
 * The bar's width comes from a `data-progress` attribute matched by a generated
 * class in `_cart.scss` (0–100 in steps of 5) rather than a bound `style`, which
 * is how this project keeps CSS out of the markup.
 */
const props = defineProps<{ totalMeters: number }>()

const { t } = useI18n()
const { meters } = useFormat()

const remaining = computed(() => metersToFreeShipping(props.totalMeters))
const isComplete = computed(() => remaining.value <= 0)

/** Rounded down to the nearest 5 so it matches a generated width class. */
const progressStep = computed(() => {
  const pct = Math.min(100, (props.totalMeters / FREE_SHIPPING_METERS) * 100)
  return Math.round(pct / 5) * 5
})
</script>

<template>
  <div
    class="ship-progress"
    :class="isComplete && 'ship-progress--complete'"
    :data-progress="progressStep"
  >
    <p class="ship-progress__text">
      <template v-if="isComplete">
        <BaseIcon name="truck" class="notice__icon" />
        {{ t('cart.freeShippingReached') }}
      </template>
      <template v-else>
        {{ t('cart.freeShippingRemaining') }}
        <strong>{{ meters(remaining) }}</strong>
      </template>
    </p>

    <div
      class="ship-progress__track"
      role="progressbar"
      :aria-valuenow="progressStep"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="t('cart.freeShippingLabel')"
    >
      <div class="ship-progress__bar" />
    </div>
  </div>
</template>
