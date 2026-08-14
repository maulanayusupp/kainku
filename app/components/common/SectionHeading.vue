<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    lead?: string
    align?: 'left' | 'center'
    /** Puts the action slot beside the title on wide screens. */
    split?: boolean
    /** Heading level — keeps the document outline correct per page. */
    as?: 'h1' | 'h2' | 'h3'
  }>(),
  { eyebrow: undefined, lead: undefined, align: 'left', as: 'h2' },
)
</script>

<template>
  <div
    class="section-head"
    :class="[align === 'center' && 'section-head--center', split && 'section-head--split']"
  >
    <div class="u-stack u-stack--sm">
      <p v-if="eyebrow" class="section-head__eyebrow">{{ eyebrow }}</p>
      <component :is="as" class="section-head__title">{{ title }}</component>
      <p v-if="lead" class="section-head__lead">{{ lead }}</p>
    </div>

    <div v-if="$slots.action" class="section-head__action">
      <slot name="action" />
    </div>
  </div>
</template>
