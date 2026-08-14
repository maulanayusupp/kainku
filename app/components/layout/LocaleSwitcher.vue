<script setup lang="ts">
/**
 * ID / EN switch.
 *
 * Uses `switchLocalePath()` so the visitor stays on the page they are reading
 * instead of being dropped on the homepage, and renders real links so the
 * alternates are crawlable.
 */
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const { t } = useI18n()

const available = computed(() =>
  (locales.value as { code: string; name: string }[]).map((entry) => ({
    code: entry.code,
    name: entry.name,
  })),
)
</script>

<template>
  <div class="locale-switch" role="group" :aria-label="t('common.language')">
    <NuxtLink
      v-for="entry in available"
      :key="entry.code"
      :to="switchLocalePath(entry.code as 'id' | 'en')"
      class="locale-switch__btn"
      :aria-current="entry.code === locale ? 'true' : undefined"
      :hreflang="entry.code"
      :title="entry.name"
    >
      {{ entry.code }}
    </NuxtLink>
  </div>
</template>
