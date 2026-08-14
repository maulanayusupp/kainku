<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="cta-band" data-reveal>
    <p class="t-eyebrow">{{ t('home.cta.eyebrow') }}</p>
    <h2 class="cta-band__title">{{ t('home.cta.title') }}</h2>
    <p class="cta-band__lead">{{ t('home.cta.lead') }}</p>

    <div class="u-cluster">
      <BaseButton variant="accent" size="lg" to="/katalog">
        {{ t('cta.browseCatalogue') }}
        <BaseIcon name="arrow-right" class="btn__icon" />
      </BaseButton>
      <BaseButton variant="outline" size="lg" to="/kontak">
        {{ t('cta.talkToUs') }}
      </BaseButton>
    </div>
  </div>
</template>
