<script setup lang="ts">
import { getAllProducts } from '~/services/product.service'

const { t, tm, rt } = useI18n()
const { altFor } = useProductContent()

const products = getAllProducts()
const cover = products[2]

const values = ['origin', 'measure', 'transparency', 'care'] as const

/** Reads the timeline array out of the locale file. */
const timeline = computed(() => {
  const raw = tm('about.timeline.items') as unknown
  if (!Array.isArray(raw)) return []
  return raw.map((entry) => {
    const item = entry as Record<string, unknown>
    return {
      year: rt(item.year as Parameters<typeof rt>[0]),
      title: rt(item.title as Parameters<typeof rt>[0]),
      text: rt(item.text as Parameters<typeof rt>[0]),
    }
  })
})

const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('nav.about') }])

useSeo(() => ({
  title: t('seo.about.title'),
  description: t('seo.about.description'),
  type: 'article',
}))
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('about.eyebrow')"
      :title="t('about.title')"
      :lead="t('about.lead')"
      :crumbs="crumbs"
    />

    <section class="u-section--tight">
      <div class="u-container">
        <div class="split split--wide-left" :class="cover && `swatch--${cover.palette}`">
          <div class="split__body">
            <h2 class="t-h2">{{ t('about.mission.title') }}</h2>
            <p class="t-lead">{{ t('about.mission.body') }}</p>
            <p class="t-body t-muted">{{ t('about.mission.body2') }}</p>
          </div>

          <figure v-if="cover" class="split__media" data-reveal>
            <img
              :src="cover.images[0]!.src"
              :alt="altFor(cover, 'drape')"
              width="600"
              height="800"
              loading="lazy"
              decoding="async"
            >
          </figure>
        </div>
      </div>
    </section>

    <section class="u-section band">
      <div class="u-container">
        <SectionHeading
          :eyebrow="t('about.values.eyebrow')"
          :title="t('about.values.title')"
          :lead="t('about.values.lead')"
        />

        <div class="value-grid">
          <article
            v-for="(value, index) in values"
            :key="value"
            class="value-card"
            data-reveal
            :data-reveal-step="index + 1"
          >
            <span class="value-card__icon">
              <BaseIcon :name="(['pin', 'ruler', 'shield', 'leaf'] as const)[index]!" />
            </span>
            <h3 class="value-card__title">{{ t(`about.values.${value}.title`) }}</h3>
            <p class="value-card__text">{{ t(`about.values.${value}.text`) }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="u-section">
      <div class="u-container">
        <div class="split split--wide-right">
          <div class="split__body">
            <SectionHeading
              :eyebrow="t('about.timeline.eyebrow')"
              :title="t('about.timeline.title')"
            />
          </div>

          <ol class="timeline">
            <li
              v-for="(entry, index) in timeline"
              :key="index"
              class="timeline__item"
              data-reveal
              :data-reveal-step="index + 1"
            >
              <p class="timeline__year">{{ entry.year }}</p>
              <h3 class="timeline__title">{{ entry.title }}</h3>
              <p class="timeline__text">{{ entry.text }}</p>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <section class="u-section--tight">
      <div class="u-container u-stack">
        <div class="notice">
          <BaseIcon name="info" class="notice__icon" />
          <span>
            <strong class="notice__title">{{ t('about.honesty.title') }}</strong>
            {{ t('about.honesty.body') }}
          </span>
        </div>
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
