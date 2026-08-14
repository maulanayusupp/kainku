<script setup lang="ts">
import { SITE } from '~/constants/site'
import { CATEGORIES, getProductsByCategory } from '~/services/product.service'
import type { ProductCategory } from '~/types/product'

const route = useRoute()
const { t } = useI18n()
const config = useRuntimeConfig()
const localePath = useLocalePath()
const { altFor } = useProductContent()

const slug = computed(() => String(route.params.slug) as ProductCategory)

if (!CATEGORIES.includes(slug.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Collection Not Found', fatal: true })
}

const products = computed(() => getProductsByCategory(slug.value))
const cover = computed(() => products.value[0])

const crumbs = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.collections'), to: '/koleksi' },
  { label: t(`catalogue.category.${slug.value}`) },
])

useSeo(() => ({
  title: t('seo.collection.title', { name: t(`catalogue.category.${slug.value}`) }),
  description: t(`collections.blurb.${slug.value}`),
  image: cover.value?.images[0]?.src,
  jsonLd: [
    breadcrumbJsonLd(
      [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.collections'), path: '/koleksi' },
        { name: t(`catalogue.category.${slug.value}`), path: `/koleksi/${slug.value}` },
      ],
      (config.public.siteUrl as string) || SITE.url,
    ),
  ],
}))
</script>

<template>
  <div>
    <section class="u-section--tight" :class="cover && `swatch--${cover.palette}`">
      <div class="u-container">
        <AppBreadcrumbs :items="crumbs" />

        <div class="collection-hero u-section--tight">
          <img
            v-if="cover"
            :src="cover.images[1]!.src"
            :alt="altFor(cover, 'macro')"
            class="collection-hero__bg"
            width="1200"
            height="600"
            decoding="async"
          >
          <div class="collection-hero__body">
            <p class="collection-hero__count">{{ t('catalogue.itemCount', products.length) }}</p>
            <h1 class="collection-hero__title">{{ t(`catalogue.category.${slug}`) }}</h1>
            <p class="collection-hero__lead">{{ t(`collections.blurb.${slug}`) }}</p>
          </div>
        </div>

        <nav class="collection-switch" :aria-label="t('nav.collections')">
          <NuxtLink
            v-for="category in CATEGORIES"
            :key="category"
            :to="localePath(`/koleksi/${category}`)"
            class="collection-switch__link"
          >
            {{ t(`catalogue.category.${category}`) }}
          </NuxtLink>
        </nav>

        <ProductGrid :products="products" :eager-count="4" />

        <div class="u-section--tight">
          <SampleDataNotice />
        </div>
      </div>
    </section>

    <section class="u-section band">
      <div class="u-container">
        <SectionHeading
          align="center"
          :title="t('collections.ctaTitle')"
          :lead="t('collections.ctaLead')"
        />
        <div class="u-cluster u-cluster--center">
          <BaseButton variant="accent" size="lg" to="/katalog">
            {{ t('cta.browseCatalogue') }}
          </BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>
