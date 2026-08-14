<script setup lang="ts">
/**
 * Honesty notice.
 *
 * The catalogue ships with illustrative data — prices, stock levels and lead
 * times are placeholders, and no payment is actually taken. This component
 * states that plainly wherever a visitor could otherwise mistake the demo for a
 * live shop. Do NOT remove it while `app/data/products.ts` still holds sample
 * figures; see CLAUDE.md § Content honesty.
 */
withDefaults(defineProps<{ variant?: 'default' | 'info' | 'warning' }>(), { variant: 'info' })

const { t } = useI18n()
</script>

<template>
  <p class="notice" :class="variant !== 'default' && `notice--${variant}`">
    <BaseIcon name="info" class="notice__icon" />
    <span>
      <strong class="notice__title">{{ t('notice.sampleData.title') }}</strong>
      {{ t('notice.sampleData.body') }}
    </span>
  </p>
</template>
