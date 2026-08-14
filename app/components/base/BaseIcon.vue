<script setup lang="ts">
/**
 * Inline icon set.
 *
 * Icons are inlined rather than loaded from a sprite or an icon font so they
 * inherit `currentColor`, cost no extra request, and cannot flash unstyled.
 * All glyphs are drawn on a 24x24 grid with a 1.6 stroke.
 *
 * @example <BaseIcon name="cart" class="btn__icon" />
 */
export type IconName = keyof typeof ICONS

const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4.5 4.5"/>',
  cart: '<path d="M6 8h12l-1.1 11.2a1 1 0 0 1-1 .8H8.1a1 1 0 0 1-1-.8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  close: '<path d="M6 6 18 18M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="m4 12.5 5.5 5.5L20 6.5"/>',
  'arrow-right': '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
  'arrow-left': '<path d="M20 12H5"/><path d="m11 18-6-6 6-6"/>',
  'arrow-up-right': '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-right': '<path d="m9 6 6 6-6 6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.6 7 8.4 5.8L20.4 7"/>',
  phone:
    '<path d="M6.4 3h2.9l1.5 3.9-2 1.4a12.4 12.4 0 0 0 6.9 6.9l1.4-2 3.9 1.5v2.9a2 2 0 0 1-2.2 2A17.4 17.4 0 0 1 3.2 5.2 2 2 0 0 1 5.2 3Z"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5Z"/>',
  pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  instagram:
    '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.4 6.6h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7.8h.01"/>',
  alert: '<path d="M12 4 21 20H3Z"/><path d="M12 10v4"/><path d="M12 17.2h.01"/>',
  trash: '<path d="M4 7h16"/><path d="M9.5 7V5h5v2"/><path d="m6.8 7 .9 12.2a1 1 0 0 0 1 .8h6.6a1 1 0 0 0 1-.8L17.2 7"/>',
  zoom: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4.5 4.5"/><path d="M8.5 11h5M11 8.5v5"/>',
  sliders: '<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="7" cy="17" r="2"/>',
  ruler: '<path d="m4 14.5 10.5-10.5 5.5 5.5L9.5 20Z"/><path d="m8 10.5 2 2M11 7.5l2 2M14.5 14.5l-2-2M11 18l-2-2"/>',
  scissors:
    '<circle cx="6.5" cy="18" r="2.6"/><circle cx="6.5" cy="6" r="2.6"/><path d="M8.7 7.4 20 18M8.7 16.6 20 6"/>',
  leaf: '<path d="M20 4c0 9.4-5.6 16-14 16 0-9.4 5.6-16 14-16Z"/><path d="m6.5 20 7.5-7.5"/>',
  truck:
    '<path d="M3 7h11v9H3Z"/><path d="M14 10.5h3.6L21 14v2h-7Z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/>',
  shield: '<path d="M12 3.2 20 6v6c0 5-3.4 8.2-8 9.2-4.6-1-8-4.2-8-9.2V6Z"/><path d="m9 12 2.2 2.2L15.2 10"/>',
  sparkle:
    '<path d="m12 3 1.9 5.4L19.5 10l-5.6 1.6L12 17l-1.9-5.4L4.5 10l5.6-1.6Z"/><path d="M18.5 16.5 19 18l1.5.5-1.5.5-.5 1.5-.5-1.5L16.5 18l1.5-.5Z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z"/>',
  package:
    '<path d="M12 3 20.5 7.5v9L12 21l-8.5-4.5v-9Z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
  send: '<path d="M21.5 2.5 10.5 13.5"/><path d="m21.5 2.5-7 19-4-8.5-8.5-4Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 2"/>',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M6.5 14.5h3"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  'external-link': '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>',
  document: '<path d="M6 3h7l5 5v13H6Z"/><path d="M13 3v5h5"/><path d="M9 13h6M9 17h6"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.4a3.2 3.2 0 0 1 0 5.2"/><path d="M17.5 14.6A5.5 5.5 0 0 1 20.5 20"/>',
} as const

const props = withDefaults(
  defineProps<{
    name: IconName
    /** Decorative by default; pass a label to expose it to screen readers. */
    label?: string
  }>(),
  { label: undefined },
)

const path = computed(() => ICONS[props.name] ?? '')
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    :aria-hidden="label ? undefined : 'true'"
    :aria-label="label"
    :role="label ? 'img' : undefined"
    focusable="false"
    v-html="path"
  />
</template>
