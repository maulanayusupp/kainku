<script setup lang="ts">
/**
 * Shared shell for every compliance document.
 *
 * The document body lives entirely in `i18n/locales/*.json` under
 * `legal.<docKey>`, which means:
 *   • adding a language translates the policies too, with nothing to re-code;
 *   • the ID and EN versions cannot silently drift apart in structure;
 *   • the sidebar comes from `useNavigation().legal`, so a new document appears
 *     in every navigation surface at once.
 *
 * Section shape in the locale file:
 *   { "heading": "…", "body": "para one\n\npara two", "list": ["…", "…"] }
 * `body` and `list` are both optional.
 */
const props = defineProps<{ docKey: string }>()

const { t, tm, rt } = useI18n()
const localePath = useLocalePath()
const { legal } = useNavigation()

const base = computed(() => `legal.${props.docKey}`)

const toText = (value: unknown): string =>
  typeof value === 'string' ? value : rt(value as Parameters<typeof rt>[0])

const sections = computed(() => {
  const raw = tm(`${base.value}.sections`) as unknown
  if (!Array.isArray(raw)) return []

  return raw.map((entry) => {
    const section = entry as Record<string, unknown>
    const listRaw = section.list
    return {
      heading: toText(section.heading),
      // Paragraphs are separated by a blank line in the locale string.
      paragraphs: section.body
        ? toText(section.body)
            .split('\n\n')
            .map((para) => para.trim())
            .filter(Boolean)
        : [],
      list: Array.isArray(listRaw) ? listRaw.map(toText) : [],
    }
  })
})

const crumbs = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.compliance'), to: '/legal' },
  { label: t(`${base.value}.title`) },
])

useSeo(() => ({
  title: t(`${base.value}.title`),
  description: t(`${base.value}.lead`),
  type: 'article',
}))
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('nav.compliance')"
      :title="t(`${base}.title`)"
      :lead="t(`${base}.lead`)"
      :crumbs="crumbs"
    />

    <section class="u-section--tight">
      <div class="u-container">
        <div class="legal-layout">
          <nav class="legal-nav" :aria-label="t('nav.compliance')">
            <NuxtLink
              v-for="link in legal"
              :key="link.to"
              :to="localePath(link.to)"
              class="legal-nav__link"
            >
              {{ t(link.labelKey) }}
            </NuxtLink>
          </nav>

          <div>
            <div class="legal-meta">
              <span>
                {{ t('legal.lastUpdated') }} <strong>{{ t(`${base}.updated`) }}</strong>
              </span>
              <span>
                {{ t('legal.appliesTo') }} <strong>{{ t('legal.appliesToValue') }}</strong>
              </span>
            </div>

            <article class="prose">
              <template v-for="(section, index) in sections" :key="index">
                <h2>{{ section.heading }}</h2>
                <p v-for="(para, pIndex) in section.paragraphs" :key="pIndex">{{ para }}</p>
                <ul v-if="section.list.length">
                  <li v-for="(item, iIndex) in section.list" :key="iIndex">{{ item }}</li>
                </ul>
              </template>

              <hr>

              <p>
                <i18n-t scope="global" :keypath="'legal.questions'" tag="span">
                  <template #contact>
                    <NuxtLink :to="localePath('/kontak')">{{ t('nav.contact') }}</NuxtLink>
                  </template>
                </i18n-t>
              </p>
            </article>

            <div class="u-section--tight">
              <SampleDataNotice />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
