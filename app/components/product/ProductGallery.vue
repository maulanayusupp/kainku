<script setup lang="ts">
import type { Product } from '~/types/product'

/**
 * Product image viewer.
 *
 * Three views per cloth — draped, macro weave, folded — so a buyer can judge
 * both the pattern scale and the texture. Thumbnails are real buttons with
 * `aria-current`, and the stage cross-fades rather than sliding.
 */
const props = defineProps<{ product: Product }>()

const { t } = useI18n()
const { altFor } = useProductContent()

const activeIndex = ref(0)
const active = computed(() => props.product.images[activeIndex.value] ?? props.product.images[0]!)

// Reset when navigating between products without unmounting the component.
watch(
  () => props.product.id,
  () => {
    activeIndex.value = 0
  },
)

function select(index: number) {
  activeIndex.value = index
}

/** Arrow keys move between views when the thumb strip has focus. */
function onKeydown(event: KeyboardEvent) {
  const count = props.product.images.length
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % count
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + count) % count
  }
}
</script>

<template>
  <div class="gallery" :class="`swatch--${product.palette}`">
    <div
      class="gallery__thumbs"
      role="tablist"
      :aria-label="t('product.galleryLabel')"
      @keydown="onKeydown"
    >
      <button
        v-for="(image, index) in product.images"
        :key="image.src"
        type="button"
        role="tab"
        class="gallery__thumb"
        :aria-current="index === activeIndex ? 'true' : undefined"
        :aria-selected="index === activeIndex"
        :aria-label="t(`product.view.${image.viewKey}`)"
        @click="select(index)"
      >
        <img
          :src="image.src"
          alt=""
          width="72"
          height="96"
          loading="lazy"
          decoding="async"
        >
      </button>
    </div>

    <div class="gallery__stage">
      <Transition name="gallery-fade" mode="out-in">
        <img
          :key="active.src"
          :src="active.src"
          :alt="altFor(product, active.viewKey)"
          class="gallery__image"
          :width="active.width"
          :height="active.height"
          fetchpriority="high"
          decoding="async"
        >
      </Transition>

      <span class="gallery__caption">{{ t(`product.view.${active.viewKey}`) }}</span>
    </div>
  </div>
</template>
