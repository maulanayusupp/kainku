<script setup lang="ts">
import { SITE } from '~/constants/site'

/**
 * Full catalogue with facets.
 *
 * Filter state lives in the URL (see `useCatalogue`), so this page is fully
 * shareable and the browser's back button steps through filter changes.
 */
const { t } = useI18n()
const config = useRuntimeConfig()
const {
  filters,
  sort,
  results,
  hasResults,
  activeFilterCount,
  sortOptions,
  setSort,
  setQuery,
  reset,
} = useCatalogue()

const isSheetOpen = ref(false)
const searchTerm = ref(filters.value.query)

// Keep the input in step when the query changes from elsewhere (back button,
// header search) without fighting the user while they type.
watch(
  () => filters.value.query,
  (value) => {
    if (value !== searchTerm.value) searchTerm.value = value
  },
)

let debounce: ReturnType<typeof setTimeout> | undefined
watch(searchTerm, (value) => {
  clearTimeout(debounce)
  debounce = setTimeout(() => setQuery(value), 300)
})
onBeforeUnmount(() => clearTimeout(debounce))

const crumbs = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.catalogue') },
])

useSeo(() => ({
  title: t('seo.catalogue.title'),
  description: t('seo.catalogue.description'),
  // Filtered permutations are thin duplicates — keep them out of the index.
  noindex: activeFilterCount.value > 0,
  jsonLd: [
    breadcrumbJsonLd(
      [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.catalogue'), path: '/katalog' },
      ],
      (config.public.siteUrl as string) || SITE.url,
    ),
  ],
}))
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('catalogue.eyebrow')"
      :title="t('catalogue.title')"
      :lead="t('catalogue.lead')"
      :crumbs="crumbs"
    />

    <section class="u-section--tight">
      <div class="u-container">
        <div class="catalogue-layout">
          <ProductFilters class="u-hide-mobile" />

          <div>
            <div class="catalogue-toolbar">
              <div class="search-field">
                <BaseIcon name="search" class="search-field__icon" />
                <input
                  v-model="searchTerm"
                  type="search"
                  class="control search-field__input"
                  :placeholder="t('catalogue.searchPlaceholder')"
                  :aria-label="t('catalogue.searchLabel')"
                >
              </div>

              <div class="catalogue-toolbar__actions">
                <BaseButton
                  class="u-hide-desktop"
                  variant="outline"
                  size="sm"
                  @click="isSheetOpen = true"
                >
                  <BaseIcon name="sliders" class="btn__icon" />
                  {{ t('catalogue.filters') }}
                  <span v-if="activeFilterCount">({{ activeFilterCount }})</span>
                </BaseButton>

                <label class="u-sr-only" for="sort-select">{{ t('catalogue.sortLabel') }}</label>
                <select
                  id="sort-select"
                  class="control control--select catalogue-toolbar__select"
                  :value="sort"
                  @change="setSort(($event.target as HTMLSelectElement).value as typeof sort)"
                >
                  <option v-for="option in sortOptions" :key="option" :value="option">
                    {{ t(`catalogue.sort.${option}`) }}
                  </option>
                </select>
              </div>
            </div>

            <p class="catalogue-toolbar__count">
              <i18n-t scope="global" keypath="catalogue.resultCount" tag="span" :plural="results.length">
                <template #count>
                  <strong>{{ results.length }}</strong>
                </template>
              </i18n-t>
            </p>

            <div v-if="activeFilterCount" class="active-filters">
              <span class="active-filters__label">{{ t('catalogue.activeFilters') }}</span>
              <button type="button" class="chip" @click="reset()">
                {{ t('catalogue.clearAll') }}
                <span class="chip__remove" aria-hidden="true">
                  <BaseIcon name="close" />
                </span>
              </button>
            </div>

            <ProductGrid v-if="hasResults" :products="results" :eager-count="4" />

            <EmptyState
              v-else
              icon="search"
              :title="t('catalogue.emptyTitle')"
              :text="t('catalogue.emptyText')"
            >
              <BaseButton variant="primary" @click="reset()">
                {{ t('catalogue.resetFilters') }}
              </BaseButton>
            </EmptyState>

            <div class="u-section--tight">
              <SampleDataNotice />
            </div>
          </div>
        </div>
      </div>
    </section>

    <ClientOnly>
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="isSheetOpen" class="sheet-backdrop" @click="isSheetOpen = false" />
        </Transition>
        <Transition name="drawer-slide">
          <ProductFilters v-if="isSheetOpen" as-sheet @close="isSheetOpen = false" />
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>
