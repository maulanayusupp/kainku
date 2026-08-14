<script setup lang="ts">
import type { ResolvedCartLine } from '~/types/cart'
import { useCartStore } from '~/stores/cart'

const props = withDefaults(
  defineProps<{ line: ResolvedCartLine; compact?: boolean }>(),
  { compact: false },
)

const { t } = useI18n()
const localePath = useLocalePath()
const cart = useCartStore()
const { price, meters } = useFormat()
const { localize, altFor } = useProductContent()
const { removeFromCart } = useCartActions()

const content = computed(() => localize(props.line.product))

const maxMeters = computed(() => Math.min(props.line.product.stockMeters, 200))

function updateMeters(value: number) {
  cart.setMeters(props.line.productId, value)
}
</script>

<template>
  <article class="cart-line" :class="`swatch--${line.product.palette}`">
    <NuxtLink :to="localePath(`/produk/${line.slug}`)" class="cart-line__media" tabindex="-1">
      <img
        :src="line.product.images[0]!.src"
        :alt="altFor(line.product, 'drape')"
        width="96"
        height="128"
        loading="lazy"
        decoding="async"
      >
    </NuxtLink>

    <div class="cart-line__body">
      <div class="cart-line__head">
        <div>
          <h3 class="cart-line__title">
            <NuxtLink :to="localePath(`/produk/${line.slug}`)">{{ content.name }}</NuxtLink>
          </h3>
          <p class="cart-line__meta">
            {{ line.product.region }} · {{ price(line.unitPrice) }}{{ t('product.perMeterShort') }}
          </p>
        </div>

        <button
          type="button"
          class="cart-line__remove"
          :aria-label="t('cart.removeNamed', { name: content.name })"
          @click="removeFromCart(line.productId, content.name)"
        >
          <BaseIcon name="trash" />
        </button>
      </div>

      <div class="cart-line__foot">
        <BaseQuantity
          :model-value="line.meters"
          :min="line.product.minOrderMeters"
          :max="maxMeters"
          :step="line.product.stepMeters"
          :size="compact ? 'sm' : 'md'"
          :label="t('cart.quantityLabel', { name: content.name })"
          @update:model-value="updateMeters"
        />

        <span class="cart-line__total">{{ price(line.lineTotal) }}</span>
      </div>

      <p v-if="line.meters >= line.product.stockMeters" class="cart-line__meta">
        {{ t('cart.maxStock', { meters: meters(line.product.stockMeters) }) }}
      </p>
    </div>
  </article>
</template>
