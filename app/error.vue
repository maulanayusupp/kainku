<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { t } = useI18n()

const is404 = computed(() => props.error?.statusCode === 404)

const title = computed(() => (is404.value ? t('error.404.title') : t('error.generic.title')))
const text = computed(() => (is404.value ? t('error.404.text') : t('error.generic.text')))

useHead({ title: () => `${title.value} · Kainku` })
</script>

<template>
  <NuxtLayout>
    <section class="u-section">
      <div class="u-container">
        <div class="confirmation">
          <p class="t-eyebrow">{{ error?.statusCode ?? 500 }}</p>
          <h1 class="t-h1">{{ title }}</h1>
          <p class="t-lead">{{ text }}</p>

          <div class="u-cluster">
            <BaseButton variant="accent" size="lg" to="/">
              {{ t('error.backHome') }}
            </BaseButton>
            <BaseButton variant="outline" size="lg" to="/katalog">
              {{ t('cta.browseCatalogue') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>
