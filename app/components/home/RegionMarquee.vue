<script setup lang="ts">
import { getAllProducts } from '~/services/product.service'

/**
 * Scrolling band of the regions represented in the catalogue.
 *
 * Derived from the product data rather than hard-coded, so it can never claim a
 * region the shop does not actually stock.
 */
const regions = computed(() => {
  // "Kota, Provinsi" → keep the province, which is the recognisable half.
  const names = getAllProducts().map((product) => {
    const parts = product.region.split(',')
    return (parts[1] ?? parts[0] ?? '').trim()
  })
  return [...new Set(names)].filter(Boolean)
})
</script>

<template>
  <div class="marquee">
    <div class="marquee__track">
      <div v-for="group in 2" :key="group" class="marquee__group" :aria-hidden="group === 2">
        <span v-for="region in regions" :key="region" class="marquee__item">{{ region }}</span>
      </div>
    </div>
  </div>
</template>
