<script setup lang="ts">
import { getAllProducts } from '~/services/product.service'

/**
 * Homepage hero.
 *
 * Rather than one hero photograph, three columns of fabric scroll past at
 * different speeds like warp threads on a loom. It is CSS-only (see
 * `_home.scss`), reuses swatches the catalogue already loads, and pauses
 * entirely for `prefers-reduced-motion`.
 */
const { t } = useI18n()
const { number } = useFormat()
const { nameOf, altFor } = useProductContent()

const products = getAllProducts()

// Four tiles per column, duplicated once so the -50% loop is seamless.
const columns = computed(() => [products.slice(0, 4), products.slice(4, 8), products.slice(8, 12)])

const stats = computed(() => [
  { value: number(products.length), label: t('home.hero.statMotifs') },
  { value: '0,5 m', label: t('home.hero.statCut') },
  { value: number(new Set(products.map((p) => p.region)).size), label: t('home.hero.statRegions') },
])
</script>

<template>
  <section class="hero theme-ink band">
    <div class="hero__glow" aria-hidden="true" />

    <div class="hero__inner">
      <div class="hero__content">
        <p class="hero__eyebrow">
          <span class="hero__eyebrow-dot" aria-hidden="true" />
          {{ t('home.hero.eyebrow') }}
        </p>

        <h1 class="hero__title">
          {{ t('home.hero.titleLead') }}
          <span class="hero__title-foil">{{ t('home.hero.titleAccent') }}</span>
          {{ t('home.hero.titleTail') }}
        </h1>

        <p class="hero__lead">{{ t('home.hero.lead') }}</p>

        <div class="hero__actions">
          <BaseButton variant="accent" size="lg" to="/katalog">
            {{ t('cta.browseCatalogue') }}
            <BaseIcon name="arrow-right" class="btn__icon" />
          </BaseButton>
          <BaseButton variant="outline" size="lg" to="/tentang">
            {{ t('cta.ourStory') }}
          </BaseButton>
        </div>

        <dl class="hero__stats">
          <div v-for="stat in stats" :key="stat.label">
            <dt class="hero__stat-label u-sr-only">{{ stat.label }}</dt>
            <dd>
              <span class="hero__stat-value">{{ stat.value }}</span>
              <span class="hero__stat-label">{{ stat.label }}</span>
            </dd>
          </div>
        </dl>
      </div>

      <div class="loom" aria-hidden="true">
        <div
          v-for="(column, index) in columns"
          :key="index"
          class="loom__col"
          :class="`loom__col--${index + 1}`"
        >
          <div
            v-for="(product, tileIndex) in [...column, ...column]"
            :key="`${product.id}-${tileIndex}`"
            class="loom__tile"
            :class="`swatch--${product.palette}`"
          >
            <img
              :src="product.images[0]!.src"
              :alt="altFor(product, 'drape')"
              width="300"
              height="400"
              :loading="tileIndex < 2 ? 'eager' : 'lazy'"
              decoding="async"
            >
            <span class="loom__tile-label">{{ nameOf(product) }}</span>
          </div>
        </div>
      </div>
    </div>

    <p class="hero__scroll">{{ t('home.hero.scroll') }}</p>
  </section>
</template>
