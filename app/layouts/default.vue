<script setup lang="ts">
/**
 * Site shell.
 *
 * `flush` removes the header offset for pages whose hero is designed to run
 * underneath the fixed header (the homepage). Pages opt in with
 * `definePageMeta({ layoutProps: ... })`-free simplicity: a route-level check
 * keeps it declarative without extra plumbing.
 */
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

useScrollReveal()

// The homepage hero sits under the transparent header; every other page does not.
const isFlush = computed(() => route.path === localePath('/') || route.path === '/')
</script>

<template>
  <div class="shell">
    <a :href="`#main`" class="u-skip-link">{{ t('common.skipToContent') }}</a>

    <AppHeader :over-hero="isFlush" />

    <main id="main" class="shell__main" :class="isFlush && 'shell__main--flush'">
      <slot />
    </main>

    <AppFooter />

    <ClientOnly>
      <CartDrawer />
      <SearchOverlay />
      <ToastStack />
    </ClientOnly>
  </div>
</template>
