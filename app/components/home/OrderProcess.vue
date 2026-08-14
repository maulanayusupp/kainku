<script setup lang="ts">
/** How ordering works, end to end. Four honest, verifiable steps. */
const { t } = useI18n()

const steps = ['choose', 'measure', 'confirm', 'ship'] as const
</script>

<template>
  <ol class="process">
    <li
      v-for="(step, index) in steps"
      :key="step"
      class="process__step"
      data-reveal
      :data-reveal-step="index + 1"
    >
      <span class="process__marker" aria-hidden="true" />
      <h3 class="process__title">{{ t(`home.process.${step}.title`) }}</h3>
      <p class="process__text">{{ t(`home.process.${step}.text`) }}</p>
    </li>
  </ol>
</template>
