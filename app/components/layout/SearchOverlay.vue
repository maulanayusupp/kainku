<script setup lang="ts">
import { getAllProducts } from '~/services/product.service'
import { matchesQuery } from '~/utils/collection'
import { useUiStore } from '~/stores/ui'

/**
 * Type-ahead product search.
 *
 * Matches against the localized name, region and category, so searching
 * "cirebon", "silk" or "sutra" all work. Limited to eight rows — anything
 * broader belongs on the catalogue page, which the last row links to.
 */
const ui = useUiStore()
const { t } = useI18n()
const localePath = useLocalePath()
const { price } = useFormat()
const { nameOf, searchIndexFor, altFor } = useProductContent()

const term = ref('')
const input = ref<HTMLInputElement | null>(null)

const results = computed(() => {
  const query = term.value.trim()
  if (query.length < 2) return []
  return getAllProducts()
    .filter((product) => matchesQuery(searchIndexFor(product), query))
    .slice(0, 8)
})

function close() {
  ui.closeSearch()
  term.value = ''
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && ui.isSearchOpen) close()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

watch(
  () => ui.isSearchOpen,
  async (open) => {
    if (!open) return
    await nextTick()
    input.value?.focus()
  },
)

function submit() {
  const query = term.value.trim()
  close()
  navigateTo({ path: localePath('/katalog'), query: query ? { q: query } : {} })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="ui.isSearchOpen" class="backdrop" @click="close()" />
    </Transition>

    <Transition name="menu-slide">
      <div
        v-if="ui.isSearchOpen"
        class="search-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="t('search.title')"
      >
        <div class="search-overlay__inner">
          <form class="search-overlay__head" role="search" @submit.prevent="submit">
            <div class="search-field">
              <BaseIcon name="search" class="search-field__icon" />
              <input
                ref="input"
                v-model="term"
                type="search"
                class="control search-field__input"
                :placeholder="t('search.placeholder')"
                :aria-label="t('search.title')"
                autocomplete="off"
              >
            </div>

            <BaseButton type="submit" variant="primary">{{ t('search.submit') }}</BaseButton>
            <BaseButton variant="ghost" icon-only :aria-label="t('common.close')" @click="close()">
              <BaseIcon name="close" class="btn__icon" />
            </BaseButton>
          </form>

          <div v-if="results.length" class="search-overlay__results">
            <NuxtLink
              v-for="product in results"
              :key="product.id"
              :to="localePath(`/produk/${product.slug}`)"
              class="search-result"
              :class="`swatch--${product.palette}`"
              @click="close()"
            >
              <img
                :src="product.images[0]!.src"
                :alt="altFor(product, 'drape')"
                width="48"
                height="60"
                loading="lazy"
              >
              <span class="search-result__body">
                <span class="search-result__title">{{ nameOf(product) }}</span>
                <span class="search-result__meta">{{ product.region }}</span>
              </span>
              <span class="search-result__price">{{ price(product.pricePerMeter) }}</span>
            </NuxtLink>
          </div>

          <p v-else-if="term.trim().length >= 2" class="t-sm t-muted">
            {{ t('search.noResults', { term: term.trim() }) }}
          </p>

          <p v-else class="t-sm t-subtle">{{ t('search.hint') }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
