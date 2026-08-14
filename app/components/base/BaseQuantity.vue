<script setup lang="ts">
/**
 * Metre quantity stepper.
 *
 * Values are metres and may be fractional (cloth is cut to the half-metre), so
 * this is a stepper rather than a number input — it makes the allowed increment
 * obvious and removes the whole class of "user typed 0.37" problems.
 */
const props = withDefaults(
  defineProps<{
    modelValue: number
    min: number
    max: number
    step: number
    size?: 'sm' | 'md'
    disabled?: boolean
    /** Accessible name, e.g. "Panjang kain dalam meter". */
    label: string
  }>(),
  { size: 'md' },
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const { meters } = useFormat()
const { t } = useI18n()

const canDecrease = computed(() => !props.disabled && props.modelValue > props.min)
const canIncrease = computed(() => !props.disabled && props.modelValue < props.max)

// Rounded to 2dp so repeated 0.5 steps cannot drift into 2.5000000000000004.
const change = (delta: number) => {
  const next = Math.round((props.modelValue + delta) * 100) / 100
  emit('update:modelValue', Math.min(Math.max(next, props.min), props.max))
}
</script>

<template>
  <div
    class="quantity"
    :class="size === 'sm' && 'quantity--sm'"
    role="group"
    :aria-label="label"
  >
    <button
      type="button"
      class="quantity__btn"
      :disabled="!canDecrease"
      :aria-label="t('common.decrease')"
      @click="change(-step)"
    >
      <BaseIcon name="minus" />
    </button>

    <output class="quantity__value" :aria-live="disabled ? 'off' : 'polite'">
      {{ meters(modelValue) }}
    </output>

    <button
      type="button"
      class="quantity__btn"
      :disabled="!canIncrease"
      :aria-label="t('common.increase')"
      @click="change(step)"
    >
      <BaseIcon name="plus" />
    </button>
  </div>
</template>
