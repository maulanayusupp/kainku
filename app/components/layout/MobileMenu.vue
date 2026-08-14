<script setup lang="ts">
import { useUiStore } from '~/stores/ui'

/**
 * Full-screen navigation for small viewports.
 *
 * Closing on Escape and trapping focus are handled here rather than in the
 * header so the header stays a presentational shell.
 */
const ui = useUiStore()
const { t } = useI18n()
const localePath = useLocalePath()
const { primary, company } = useNavigation()

const panel = ref<HTMLElement | null>(null)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && ui.isMenuOpen) ui.closeMenu()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

// Move focus into the panel when it opens so keyboard users land in the menu.
watch(
  () => ui.isMenuOpen,
  async (open) => {
    if (!open) return
    await nextTick()
    panel.value?.querySelector<HTMLElement>('a, button')?.focus()
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="menu-slide">
      <div
        v-if="ui.isMenuOpen"
        id="mobile-menu"
        ref="panel"
        class="mobile-menu"
        role="dialog"
        aria-modal="true"
        :aria-label="t('common.mainNav')"
      >
        <nav class="mobile-menu__nav" :aria-label="t('common.mainNav')">
          <NuxtLink
            v-for="link in primary"
            :key="link.to"
            :to="localePath(link.to)"
            class="mobile-menu__link"
            @click="ui.closeMenu()"
          >
            {{ t(link.labelKey) }}
            <BaseIcon name="arrow-up-right" />
          </NuxtLink>
        </nav>

        <div class="mobile-menu__foot">
          <div class="u-cluster">
            <NuxtLink
              v-for="link in company"
              :key="link.to"
              :to="localePath(link.to)"
              class="t-sm t-muted"
              @click="ui.closeMenu()"
            >
              {{ t(link.labelKey) }}
            </NuxtLink>
          </div>

          <LocaleSwitcher />

          <BaseButton variant="accent" size="lg" to="/katalog" block @click="ui.closeMenu()">
            {{ t('cta.browseCatalogue') }}
            <BaseIcon name="arrow-right" class="btn__icon" />
          </BaseButton>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
