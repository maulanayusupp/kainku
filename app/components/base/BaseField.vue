<script setup lang="ts">
/**
 * Label + control + hint/error wrapper.
 *
 * Owns the id wiring so every control is correctly labelled and every error is
 * announced: `aria-describedby` points at the hint and the error, and
 * `aria-invalid` flips when `error` is set. The control itself is supplied via
 * the default slot, which receives the generated ids.
 */
const props = withDefaults(
  defineProps<{
    label: string
    /** i18n key of the current error, or `undefined` when valid. */
    error?: string
    hint?: string
    required?: boolean
    optionalText?: string
  }>(),
  { error: undefined, hint: undefined, optionalText: undefined },
)

const uid = useId()
const controlId = `f-${uid}`
const hintId = `${controlId}-hint`
const errorId = `${controlId}-error`

const describedBy = computed(() =>
  [props.hint ? hintId : null, props.error ? errorId : null].filter(Boolean).join(' ') || undefined,
)
</script>

<template>
  <div class="field">
    <label :for="controlId" class="field__label">
      {{ label }}
      <span v-if="!required && optionalText" class="field__optional">{{ optionalText }}</span>
    </label>

    <slot
      :id="controlId"
      :described-by="describedBy"
      :invalid="Boolean(error)"
    />

    <p v-if="hint && !error" :id="hintId" class="field__hint">{{ hint }}</p>

    <p v-if="error" :id="errorId" class="field__error" role="alert">
      <BaseIcon name="alert" class="field__error-icon" />
      {{ error }}
    </p>
  </div>
</template>
