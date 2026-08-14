<script setup lang="ts">
import type { ColorFamily, MaterialKey, ProductCategory } from '~/types/product'

/**
 * Facet panel.
 *
 * Every control writes straight to the URL through `useCatalogue().apply()`, so
 * the panel holds no state of its own and a shared link reproduces the exact
 * view. On narrow screens the same markup renders as a bottom sheet.
 */
defineProps<{ asSheet?: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const { price } = useFormat()
const {
  filters,
  facets,
  priceBounds,
  activeFilterCount,
  toggleCategory,
  toggleMaterial,
  toggleColor,
  toggleInStock,
  setPriceRange,
  reset,
} = useCatalogue()

// The range input is a single upper bound — a genuine dual-thumb slider needs
// far more machinery than the catalogue warrants at this size.
const maxPrice = computed({
  get: () => filters.value.maxPrice ?? priceBounds.max,
  set: (value: number) => setPriceRange(priceBounds.min, value),
})

const isCategoryOn = (value: ProductCategory) => filters.value.categories.includes(value)
const isMaterialOn = (value: MaterialKey) => filters.value.materials.includes(value)
const isColorOn = (value: ColorFamily) => filters.value.colors.includes(value)
</script>

<template>
  <aside
    class="filters"
    :class="asSheet && 'filters--sheet'"
    :aria-label="t('catalogue.filtersLabel')"
  >
    <div v-if="asSheet" class="filters__grab" aria-hidden="true" />

    <div class="filters__head">
      <p class="filters__legend">
        {{ t('catalogue.filters') }}
        <span v-if="activeFilterCount">({{ activeFilterCount }})</span>
      </p>
      <button v-if="activeFilterCount" type="button" class="filters__reset" @click="reset()">
        {{ t('catalogue.resetFilters') }}
      </button>
    </div>

    <fieldset class="filters__group">
      <legend class="filters__legend">{{ t('catalogue.byCategory') }}</legend>
      <div class="filters__options">
        <button
          v-for="facet in facets.categories"
          :key="facet.value"
          type="button"
          class="chip"
          :aria-pressed="isCategoryOn(facet.value)"
          @click="toggleCategory(facet.value)"
        >
          {{ t(`catalogue.category.${facet.value}`) }}
          <span class="chip__count">{{ facet.count }}</span>
        </button>
      </div>
    </fieldset>

    <fieldset class="filters__group">
      <legend class="filters__legend">{{ t('catalogue.byMaterial') }}</legend>
      <div class="filters__options">
        <button
          v-for="facet in facets.materials"
          :key="facet.value"
          type="button"
          class="chip"
          :aria-pressed="isMaterialOn(facet.value)"
          @click="toggleMaterial(facet.value)"
        >
          {{ t(`catalogue.material.${facet.value}`) }}
          <span class="chip__count">{{ facet.count }}</span>
        </button>
      </div>
    </fieldset>

    <fieldset class="filters__group">
      <legend class="filters__legend">{{ t('catalogue.byColor') }}</legend>
      <div class="filters__options">
        <button
          v-for="facet in facets.colors"
          :key="facet.value"
          type="button"
          class="chip"
          :aria-pressed="isColorOn(facet.value)"
          @click="toggleColor(facet.value)"
        >
          <span class="family-dot" :class="`family-dot--${facet.value}`" aria-hidden="true" />
          {{ t(`catalogue.color.${facet.value}`) }}
          <span class="chip__count">{{ facet.count }}</span>
        </button>
      </div>
    </fieldset>

    <fieldset class="filters__group">
      <legend class="filters__legend">{{ t('catalogue.byPrice') }}</legend>
      <div class="price-range">
        <div class="price-range__values">
          <span>{{ price(priceBounds.min) }}</span>
          <span>{{ price(maxPrice) }}</span>
        </div>
        <input
          v-model.number="maxPrice"
          type="range"
          class="price-range__input"
          :min="priceBounds.min"
          :max="priceBounds.max"
          :step="5000"
          :aria-label="t('catalogue.maxPriceLabel')"
        >
      </div>
    </fieldset>

    <fieldset class="filters__group">
      <legend class="filters__legend">{{ t('catalogue.availability') }}</legend>
      <label class="choice">
        <input type="checkbox" :checked="filters.inStockOnly" @change="toggleInStock()">
        <span class="choice__text">{{ t('catalogue.inStockOnly') }}</span>
      </label>
    </fieldset>

    <BaseButton v-if="asSheet" variant="primary" block @click="emit('close')">
      {{ t('catalogue.showResults') }}
    </BaseButton>
  </aside>
</template>
