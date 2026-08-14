<script setup lang="ts">
import { CATEGORIES, getProductsByCategory } from '~/services/product.service'

const { t } = useI18n()
const localePath = useLocalePath()
const { altFor } = useProductContent()

const collections = computed(() =>
  CATEGORIES.map((category) => {
    const items = getProductsByCategory(category)
    return { category, items, cover: items[0] }
  }).filter((entry) => entry.cover),
)

const crumbs = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.collections') },
])

useSeo(() => ({
  title: t('seo.collections.title'),
  description: t('seo.collections.description'),
}))
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('collections.eyebrow')"
      :title="t('collections.title')"
      :lead="t('collections.lead')"
      :crumbs="crumbs"
    />

    <section class="u-section--tight">
      <div class="u-container u-stack u-stack--lg">
        <article
          v-for="(entry, index) in collections"
          :key="entry.category"
          class="split"
          :class="[index % 2 ? 'split--wide-right' : 'split--wide-left', `swatch--${entry.cover!.palette}`]"
          data-reveal
        >
          <figure class="split__media" :class="index % 2 ? 'u-hide-mobile' : undefined">
            <img
              :src="entry.cover!.images[2]!.src"
              :alt="altFor(entry.cover!, 'fold')"
              width="600"
              height="750"
              loading="lazy"
              decoding="async"
            >
          </figure>

          <div class="split__body">
            <p class="t-eyebrow">{{ t('catalogue.itemCount', entry.items.length) }}</p>
            <h2 class="t-h2">{{ t(`catalogue.category.${entry.category}`) }}</h2>
            <p class="t-lead">{{ t(`collections.blurb.${entry.category}`) }}</p>

            <div class="u-cluster">
              <BaseButton variant="primary" :to="`/koleksi/${entry.category}`">
                {{ t('cta.exploreCollection') }}
                <BaseIcon name="arrow-right" class="btn__icon" />
              </BaseButton>
            </div>
          </div>

          <figure v-if="index % 2" class="split__media u-hide-desktop">
            <img
              :src="entry.cover!.images[2]!.src"
              :alt="altFor(entry.cover!, 'fold')"
              width="600"
              height="750"
              loading="lazy"
              decoding="async"
            >
          </figure>
        </article>
      </div>
    </section>

    <section class="u-section">
      <div class="u-container">
        <ClosingCta />
      </div>
    </section>
  </div>
</template>
