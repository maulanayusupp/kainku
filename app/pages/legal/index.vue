<script setup lang="ts">
/**
 * Compliance hub — one card per policy so a visitor (or an auditor) can see
 * everything the site publishes in one place.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const { legal } = useNavigation()

/** Every document except the overview itself. */
const documents = computed(() => legal.slice(1))

const iconFor: Record<string, 'shield' | 'document' | 'truck' | 'package' | 'info' | 'users' | 'alert'> = {
  '/legal/privasi': 'shield',
  '/legal/ketentuan': 'document',
  '/legal/pengiriman': 'truck',
  '/legal/pengembalian': 'package',
  '/legal/cookie': 'info',
  '/legal/aksesibilitas': 'users',
  '/legal/disclaimer': 'alert',
}

const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('nav.compliance') }])

useSeo(() => ({
  title: t('seo.legal.title'),
  description: t('seo.legal.description'),
}))
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('nav.compliance')"
      :title="t('legal.overview.title')"
      :lead="t('legal.overview.lead')"
      :crumbs="crumbs"
    />

    <section class="u-section--tight">
      <div class="u-container u-stack u-stack--lg">
        <p class="notice notice--info">
          <BaseIcon name="info" class="notice__icon" />
          <span>
            <strong class="notice__title">{{ t('legal.overview.noticeTitle') }}</strong>
            {{ t('legal.overview.noticeBody') }}
          </span>
        </p>

        <div class="value-grid">
          <NuxtLink
            v-for="(doc, index) in documents"
            :key="doc.to"
            :to="localePath(doc.to)"
            class="value-card"
            data-reveal
            :data-reveal-step="index + 1"
          >
            <span class="value-card__icon">
              <BaseIcon :name="iconFor[doc.to] ?? 'document'" />
            </span>
            <h2 class="value-card__title">{{ t(doc.labelKey) }}</h2>
            <p class="value-card__text">{{ t(`legal.overview.summary.${doc.to.split('/').pop()}`) }}</p>
            <span class="link-underline">
              {{ t('cta.readDocument') }}
              <BaseIcon name="arrow-right" class="btn__icon" />
            </span>
          </NuxtLink>
        </div>

        <SampleDataNotice />
      </div>
    </section>
  </div>
</template>
