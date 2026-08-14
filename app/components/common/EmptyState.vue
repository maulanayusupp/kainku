<script setup lang="ts">
import type { IconName } from '~/components/base/BaseIcon.vue'

withDefaults(
  defineProps<{
    icon?: IconName
    title: string
    text?: string
  }>(),
  { icon: 'search', text: undefined },
)
</script>

<template>
  <div class="empty-state">
    <BaseIcon :name="icon" class="empty-state__icon" />
    <p class="empty-state__title">{{ title }}</p>
    <p v-if="text" class="empty-state__text">{{ text }}</p>
    <div v-if="$slots.default" class="u-cluster">
      <slot />
    </div>
  </div>
</template>
