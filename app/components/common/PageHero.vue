<script setup lang="ts">
import type { Crumb } from './AppBreadcrumbs.vue'

withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    lead?: string
    crumbs?: Crumb[]
  }>(),
  { eyebrow: undefined, lead: undefined, crumbs: () => [] },
)
</script>

<template>
  <section class="page-hero">
    <div class="page-hero__bg" aria-hidden="true" />
    <div class="u-container">
      <div class="page-hero__inner">
        <AppBreadcrumbs v-if="crumbs.length" :items="crumbs" />
        <p v-if="eyebrow" class="t-eyebrow">{{ eyebrow }}</p>
        <h1 class="page-hero__title">{{ title }}</h1>
        <p v-if="lead" class="page-hero__lead">{{ lead }}</p>
        <div v-if="$slots.default" class="u-cluster">
          <slot />
        </div>
      </div>
    </div>
  </section>
</template>
