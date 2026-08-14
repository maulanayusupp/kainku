<script setup lang="ts">
/**
 * Live region for transient feedback.
 *
 * `aria-live="polite"` announces new toasts without interrupting whatever the
 * user is doing; the container is always present so screen readers register the
 * region before the first message arrives.
 */
const { toasts, dismiss } = useToast()
const { t } = useI18n()
const localePath = useLocalePath()

const iconFor = (tone: string) => (tone === 'error' ? 'alert' : tone === 'info' ? 'info' : 'check')
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" role="status" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast-list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.tone}`"
        >
          <BaseIcon :name="iconFor(toast.tone)" class="toast__icon" />
          <span class="toast__message">{{ toast.message }}</span>

          <NuxtLink
            v-if="toast.action"
            :to="localePath(toast.action.to)"
            class="toast__action"
            @click="dismiss(toast.id)"
          >
            {{ toast.action.label }}
          </NuxtLink>

          <button
            type="button"
            class="toast__close"
            :aria-label="t('common.dismiss')"
            @click="dismiss(toast.id)"
          >
            <BaseIcon name="close" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
