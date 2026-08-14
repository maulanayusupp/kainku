<script setup lang="ts">
import { SITE } from '~/constants/site'
import type { AccordionItem } from '~/components/base/BaseAccordion.vue'

const { t, tm, rt } = useI18n()

/** FAQ entries live in the locale files so both languages stay in step. */
const items = computed<AccordionItem[]>(() => {
  const raw = tm('faq.items') as unknown
  if (!Array.isArray(raw)) return []
  return raw.map((entry, index) => {
    const item = entry as Record<string, unknown>
    return {
      id: `q${index + 1}`,
      question: rt(item.q as Parameters<typeof rt>[0]),
      answer: rt(item.a as Parameters<typeof rt>[0]),
    }
  })
})

const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('nav.faq') }])

useSeo(() => ({
  title: t('seo.faq.title'),
  description: t('seo.faq.description'),
  jsonLd: [
    {
      '@type': 'FAQPage',
      mainEntity: items.value.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ],
}))
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('faq.eyebrow')"
      :title="t('faq.title')"
      :lead="t('faq.lead')"
      :crumbs="crumbs"
    />

    <section class="u-section--tight">
      <div class="u-container">
        <div class="faq-layout">
          <aside class="faq-aside">
            <div class="contact-card">
              <p class="contact-card__label">{{ t('faq.stillStuck') }}</p>
              <p class="contact-card__note">{{ t('faq.stillStuckText') }}</p>
              <BaseButton variant="primary" to="/kontak">{{ t('cta.talkToUs') }}</BaseButton>
            </div>
            <SampleDataNotice />
          </aside>

          <BaseAccordion :items="items" :default-open="items[0]?.id" />
        </div>
      </div>
    </section>
  </div>
</template>
