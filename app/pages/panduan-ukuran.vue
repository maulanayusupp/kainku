<script setup lang="ts">
/**
 * How much cloth to order.
 *
 * The figures are conventional starting points for a 115 cm width and are
 * labelled as estimates — they are not a promise that a given length will be
 * enough for a particular pattern.
 */
const { t, tm, rt } = useI18n()

const rows = computed(() => {
  const raw = tm('sizeGuide.rows') as unknown
  if (!Array.isArray(raw)) return []
  return raw.map((entry) => {
    const row = entry as Record<string, unknown>
    return {
      item: rt(row.item as Parameters<typeof rt>[0]),
      meters: rt(row.meters as Parameters<typeof rt>[0]),
      note: rt(row.note as Parameters<typeof rt>[0]),
    }
  })
})

const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('nav.sizeGuide') }])

useSeo(() => ({
  title: t('seo.sizeGuide.title'),
  description: t('seo.sizeGuide.description'),
  type: 'article',
}))
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('sizeGuide.eyebrow')"
      :title="t('sizeGuide.title')"
      :lead="t('sizeGuide.lead')"
      :crumbs="crumbs"
    />

    <section class="u-section--tight">
      <div class="u-container u-container--narrow u-stack u-stack--lg">
        <p class="notice notice--info">
          <BaseIcon name="info" class="notice__icon" />
          <span>
            <strong class="notice__title">{{ t('sizeGuide.disclaimer.title') }}</strong>
            {{ t('sizeGuide.disclaimer.body') }}
          </span>
        </p>

        <table class="spec-table">
          <thead>
            <tr>
              <th scope="col">{{ t('sizeGuide.colItem') }}</th>
              <th scope="col">{{ t('sizeGuide.colMeters') }}</th>
              <th scope="col">{{ t('sizeGuide.colNote') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.item">
              <th scope="row">{{ row.item }}</th>
              <td>{{ row.meters }}</td>
              <td>{{ row.note }}</td>
            </tr>
          </tbody>
        </table>

        <div class="prose">
          <h2>{{ t('sizeGuide.howToMeasure.title') }}</h2>
          <p>{{ t('sizeGuide.howToMeasure.body') }}</p>

          <h2>{{ t('sizeGuide.shrinkage.title') }}</h2>
          <p>{{ t('sizeGuide.shrinkage.body') }}</p>
        </div>

        <div class="u-cluster">
          <BaseButton variant="accent" to="/katalog">{{ t('cta.browseCatalogue') }}</BaseButton>
          <BaseButton variant="outline" to="/kontak">{{ t('cta.talkToUs') }}</BaseButton>
        </div>
      </div>
    </section>
  </div>
</template>
