<script setup lang="ts">
import type { Product } from '~/types/product'

withDefaults(
  defineProps<{
    products: Product[]
    /** `rail` turns the grid into a horizontally snapping carousel. */
    layout?: 'grid' | 'rail'
    /** How many leading cards load eagerly (above the fold). */
    eagerCount?: number
    hideAdd?: boolean
  }>(),
  { layout: 'grid', eagerCount: 4, hideAdd: false },
)
</script>

<template>
  <div class="product-grid" :class="layout === 'rail' && 'product-grid--rail'">
    <ProductCard
      v-for="(product, index) in products"
      :key="product.id"
      :product="product"
      :eager="index < eagerCount"
      :hide-add="hideAdd"
      data-reveal
      :data-reveal-step="Math.min((index % 4) + 1, 12)"
    />
  </div>
</template>
