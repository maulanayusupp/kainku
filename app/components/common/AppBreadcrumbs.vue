<script setup lang="ts">
/**
 * Breadcrumb trail. Emits no JSON-LD of its own — pages pass the same items to
 * `useSeo({ jsonLd: [breadcrumbJsonLd(...)] })` so the structured data and the
 * visible trail cannot drift apart.
 */
export interface Crumb {
  label: string
  /** Omit on the final crumb. */
  to?: string
}

defineProps<{ items: Crumb[] }>()

const localePath = useLocalePath()
const { t } = useI18n()
</script>

<template>
  <nav class="breadcrumbs" :aria-label="t('common.breadcrumb')">
    <span v-for="(item, index) in items" :key="index" class="breadcrumbs__item">
      <NuxtLink v-if="item.to" :to="localePath(item.to)" class="breadcrumbs__link">
        {{ item.label }}
      </NuxtLink>
      <span v-else class="breadcrumbs__current" aria-current="page">{{ item.label }}</span>
    </span>
  </nav>
</template>
