<script setup lang="ts">
import { CATEGORIES, getProductsByCategory } from '~/services/product.service'

/** Four collection cards, each fronted by a product from that collection. */
const { t } = useI18n()
const localePath = useLocalePath()

const cards = computed(() =>
  CATEGORIES.map((category) => {
    const items = getProductsByCategory(category)
    return { category, cover: items[0], count: items.length }
  }).filter((card) => card.cover),
)
</script>

<template>
  <div class="category-grid">
    <NuxtLink
      v-for="(card, index) in cards"
      :key="card.category"
      :to="localePath(`/koleksi/${card.category}`)"
      class="category-card"
      :class="`swatch--${card.cover!.palette}`"
      data-reveal
      :data-reveal-step="index + 1"
    >
      <img
        :src="card.cover!.images[2]!.src"
        alt=""
        width="500"
        height="625"
        loading="lazy"
        decoding="async"
      >
      <h3 class="category-card__name">{{ t(`catalogue.category.${card.category}`) }}</h3>
      <p class="category-card__meta">
        <span>{{ t('catalogue.itemCount', card.count) }}</span>
        <BaseIcon name="arrow-right" class="category-card__arrow" />
      </p>
    </NuxtLink>
  </div>
</template>
