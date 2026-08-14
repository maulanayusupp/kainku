<script setup lang="ts">
/**
 * Root component.
 *
 * Only sets the document-level i18n attributes; every visual concern belongs to
 * a layout or a page.
 */
const { locale } = useI18n()

useHead({
  htmlAttrs: {
    lang: computed(() => locale.value),
    dir: 'ltr',
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
