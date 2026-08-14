<script setup lang="ts">
/**
 * The one button in the system.
 *
 * Renders a `<NuxtLink>` when given `to`, an `<a>` when given `href`, and a
 * `<button>` otherwise — so a "link that looks like a button" never has to be
 * faked with a click handler.
 */
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'accent' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    /** Internal route. Automatically passed through `localePath()`. */
    to?: string
    /** External URL. Opens in a new tab with the usual rel guard. */
    href?: string
    type?: 'button' | 'submit' | 'reset'
    block?: boolean
    disabled?: boolean
    loading?: boolean
    /** Square icon-only button; supply `aria-label` on the usage site. */
    iconOnly?: boolean
  }>(),
  {
    variant: 'outline',
    size: 'md',
    type: 'button',
    to: undefined,
    href: undefined,
  },
)

const localePath = useLocalePath()

const classes = computed(() => [
  'btn',
  `btn--${props.variant}`,
  props.size !== 'md' && `btn--${props.size}`,
  props.block && 'btn--block',
  props.iconOnly && 'btn--icon',
])

const isDisabled = computed(() => props.disabled || props.loading)
</script>

<template>
  <NuxtLink
    v-if="to && !isDisabled"
    :to="localePath(to)"
    :class="classes"
  >
    <slot />
  </NuxtLink>

  <a
    v-else-if="href && !isDisabled"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    :class="classes"
  >
    <slot />
  </a>

  <button
    v-else
    :type="type"
    :class="classes"
    :disabled="isDisabled"
    :aria-busy="loading ? 'true' : undefined"
  >
    <slot />
  </button>
</template>
