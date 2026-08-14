<script setup lang="ts">
import type { Product } from '~/types/product'

/**
 * Catalogue card.
 *
 * The whole card is clickable via a stretched pseudo-element on the title link
 * (see `_product-card.scss`), which keeps exactly one link in the accessibility
 * tree while still giving a large pointer target. The quick-add button is
 * raised above it so it stays independently clickable.
 */
const props = withDefaults(
  defineProps<{
    product: Product
    /** Above-the-fold cards should load eagerly; the rest stay lazy. */
    eager?: boolean
    /** Hide the quick-add control (used in tight rails). */
    hideAdd?: boolean
  }>(),
  { eager: false, hideAdd: false },
)

const { t } = useI18n()
const localePath = useLocalePath()
const { price, discountPercent } = useFormat()
const { localize, altFor } = useProductContent()
const { addToCart } = useCartActions()

const content = computed(() => localize(props.product))
const isSoldOut = computed(() => props.product.stockMeters <= 0)

const saving = computed(() =>
  props.product.compareAtPrice
    ? discountPercent(props.product.compareAtPrice, props.product.pricePerMeter)
    : 0,
)

const badgeClass = computed(() => {
  switch (props.product.badge) {
    case 'baru':
      return 'badge--new'
    case 'terbatas':
      return 'badge--limited'
    case 'favorit':
      return 'badge--accent'
    default:
      return ''
  }
})
</script>

<template>
  <article
    class="product-card"
    :class="[`swatch--${product.palette}`, isSoldOut && 'product-card--sold-out']"
  >
    <div class="product-card__media">
      <img
        :src="product.images[0]!.src"
        :alt="altFor(product, 'drape')"
        class="product-card__img product-card__img--drape"
        :width="product.images[0]!.width"
        :height="product.images[0]!.height"
        :loading="eager ? 'eager' : 'lazy'"
        :fetchpriority="eager ? 'high' : 'auto'"
        decoding="async"
      >
      <!-- Revealed on hover: a macro crop of the same cloth. -->
      <img
        :src="product.images[1]!.src"
        alt=""
        aria-hidden="true"
        class="product-card__img product-card__img--macro"
        loading="lazy"
        decoding="async"
      >

      <div class="product-card__badges">
        <span v-if="isSoldOut" class="badge badge--sold-out">{{ t('product.soldOut') }}</span>
        <span v-else-if="saving > 0" class="badge badge--sale">-{{ saving }}%</span>
        <span v-if="product.badge && !isSoldOut" class="badge" :class="badgeClass">
          {{ t(`product.badge.${product.badge}`) }}
        </span>
      </div>

      <span class="product-card__peek">
        <BaseIcon name="zoom" />
        {{ t('product.peek') }}
      </span>
    </div>

    <div class="product-card__body">
      <p class="product-card__region">
        <span class="swatch-dot" aria-hidden="true" />
        {{ product.region }}
      </p>

      <h3 class="product-card__title">
        <NuxtLink :to="localePath(`/produk/${product.slug}`)">{{ content.name }}</NuxtLink>
      </h3>

      <p class="product-card__tagline">{{ content.tagline }}</p>

      <div class="product-card__footer">
        <div class="product-card__price">
          <span v-if="product.compareAtPrice" class="product-card__compare">
            {{ price(product.compareAtPrice) }}
          </span>
          <span class="product-card__price-value">{{ price(product.pricePerMeter) }}</span>
          <span class="product-card__price-unit">{{ t('product.perMeter') }}</span>
        </div>

        <BaseButton
          v-if="!hideAdd"
          class="product-card__add"
          variant="outline"
          size="sm"
          icon-only
          :disabled="isSoldOut"
          :aria-label="t('cart.addNamed', { name: content.name })"
          @click="addToCart(product)"
        >
          <BaseIcon name="plus" class="btn__icon" />
        </BaseButton>
      </div>
    </div>
  </article>
</template>
