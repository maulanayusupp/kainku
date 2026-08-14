<script setup lang="ts">
/**
 * Accessible disclosure list.
 *
 * The panel animates with `grid-template-rows: 0fr → 1fr` so it works at any
 * content height without measuring anything in JavaScript. Panels stay in the
 * DOM (and in the accessible tree via `hidden="until-found"` where supported)
 * so in-page search can find the answers.
 */
export interface AccordionItem {
  id: string
  question: string
  answer: string
}

const props = withDefaults(
  defineProps<{
    items: AccordionItem[]
    /** Allow several panels open at once. */
    multiple?: boolean
    /** Id of the panel open on first render. */
    defaultOpen?: string
  }>(),
  { defaultOpen: undefined },
)

const open = ref<string[]>(props.defaultOpen ? [props.defaultOpen] : [])

const isOpen = (id: string) => open.value.includes(id)

function toggle(id: string) {
  if (isOpen(id)) {
    open.value = open.value.filter((entry) => entry !== id)
  } else {
    open.value = props.multiple ? [...open.value, id] : [id]
  }
}
</script>

<template>
  <div class="accordion">
    <div v-for="item in items" :key="item.id" class="accordion__item">
      <h3>
        <button
          :id="`acc-btn-${item.id}`"
          type="button"
          class="accordion__trigger"
          :aria-expanded="isOpen(item.id)"
          :aria-controls="`acc-panel-${item.id}`"
          @click="toggle(item.id)"
        >
          <span>{{ item.question }}</span>
          <span class="accordion__icon" aria-hidden="true" />
        </button>
      </h3>

      <div
        :id="`acc-panel-${item.id}`"
        class="accordion__panel"
        :data-open="isOpen(item.id)"
        role="region"
        :aria-labelledby="`acc-btn-${item.id}`"
      >
        <div class="accordion__panel-inner">
          <div class="accordion__body">{{ item.answer }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
