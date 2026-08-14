<script setup lang="ts">
import { getProductBySlug } from '~/services/product.service'

/**
 * "Anatomi kain" — explains the spec vocabulary used on every product page, so
 * a first-time buyer knows what "gramasi 130 gsm" or "lebar 115 cm" means before
 * they have to choose.
 */
const { t } = useI18n()
const { altFor } = useProductContent()

const sample = getProductBySlug('batik-tulis-parang-barong')

const terms = computed(() => [
  { key: 'width', icon: 'ruler' as const },
  { key: 'weight', icon: 'package' as const },
  { key: 'material', icon: 'leaf' as const },
  { key: 'technique', icon: 'scissors' as const },
])
</script>

<template>
  <div class="anatomy">
    <figure v-if="sample" class="anatomy__media" :class="`swatch--${sample.palette}`" data-reveal>
      <img
        :src="sample.images[1]!.src"
        :alt="altFor(sample, 'macro')"
        width="600"
        height="600"
        loading="lazy"
        decoding="async"
      >
    </figure>

    <dl class="anatomy__list">
      <div
        v-for="(term, index) in terms"
        :key="term.key"
        class="anatomy__item"
        data-reveal
        :data-reveal-step="index + 1"
      >
        <span class="anatomy__num">{{ String(index + 1).padStart(2, '0') }}</span>
        <div>
          <dt class="anatomy__term">{{ t(`home.anatomy.${term.key}.term`) }}</dt>
          <dd class="anatomy__desc">{{ t(`home.anatomy.${term.key}.desc`) }}</dd>
        </div>
      </div>
    </dl>
  </div>
</template>
