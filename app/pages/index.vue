<script setup lang="ts">
import { getFeaturedProducts, getNewestProducts } from '~/services/product.service'

const { t } = useI18n()

const featured = getFeaturedProducts(6)
const newest = getNewestProducts(4)

useSeo(() => ({
  title: t('seo.home.title'),
  description: t('seo.home.description'),
  type: 'website',
}))
</script>

<template>
  <div>
    <HeroLoom />

    <RegionMarquee />

    <section class="u-section">
      <div class="u-container">
        <SectionHeading
          split
          :eyebrow="t('home.featured.eyebrow')"
          :title="t('home.featured.title')"
          :lead="t('home.featured.lead')"
        >
          <template #action>
            <BaseButton variant="outline" to="/katalog">
              {{ t('cta.seeAll') }}
              <BaseIcon name="arrow-right" class="btn__icon" />
            </BaseButton>
          </template>
        </SectionHeading>

        <ProductGrid :products="featured" layout="rail" :eager-count="3" />
      </div>
    </section>

    <section class="u-section band">
      <div class="u-container">
        <SectionHeading
          :eyebrow="t('home.collections.eyebrow')"
          :title="t('home.collections.title')"
          :lead="t('home.collections.lead')"
        />
        <CategoryShowcase />
      </div>
    </section>

    <section class="u-section">
      <div class="u-container">
        <SectionHeading
          :eyebrow="t('home.anatomy.eyebrow')"
          :title="t('home.anatomy.title')"
          :lead="t('home.anatomy.lead')"
        />
        <FabricAnatomy />
      </div>
    </section>

    <section class="u-section theme-ink band band--feathered">
      <div class="u-container">
        <SectionHeading
          :eyebrow="t('home.process.eyebrow')"
          :title="t('home.process.title')"
          :lead="t('home.process.lead')"
        />
        <OrderProcess />
      </div>
    </section>

    <section class="u-section">
      <div class="u-container">
        <SectionHeading
          split
          :eyebrow="t('home.newest.eyebrow')"
          :title="t('home.newest.title')"
        >
          <template #action>
            <BaseButton variant="ghost" to="/katalog?urut=newest">
              {{ t('cta.seeAll') }}
              <BaseIcon name="arrow-right" class="btn__icon" />
            </BaseButton>
          </template>
        </SectionHeading>

        <ProductGrid :products="newest" :eager-count="0" />
      </div>
    </section>

    <section class="u-section--tight">
      <div class="u-container">
        <SampleDataNotice />
      </div>
    </section>

    <section class="u-section">
      <div class="u-container">
        <ClosingCta />
      </div>
    </section>
  </div>
</template>
