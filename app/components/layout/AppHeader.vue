<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useUiStore } from '~/stores/ui'

/**
 * Fixed site header.
 *
 * Sits transparent over the homepage hero (which supplies the ink theme) and
 * frosts over once the page scrolls. The scroll listener is passive and only
 * flips a boolean, so it never blocks scrolling.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const cart = useCartStore()
const ui = useUiStore()
const { primary } = useNavigation()

const isScrolled = ref(false)

function onScroll() {
  isScrolled.value = window.scrollY > 24
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

// The announcement bar rotates a few honest, checkable statements.
const announcements = computed(() => [
  t('announce.cutToOrder'),
  t('announce.freeShipping'),
  t('announce.swatches'),
  t('announce.support'),
])
</script>

<template>
  <div>
    <div class="announce">
      <div class="announce__track">
        <!-- Duplicated once so the marquee can loop seamlessly at -50%. -->
        <div v-for="group in 2" :key="group" class="announce__group" :aria-hidden="group === 2">
          <span v-for="item in announcements" :key="item" class="announce__item">{{ item }}</span>
        </div>
      </div>
    </div>

    <header class="header" :class="isScrolled && 'header--scrolled'">
      <div class="header__inner">
        <NuxtLink :to="localePath('/')" class="header__brand">
          <img
            src="/images/brand/logo-mark.svg"
            alt=""
            class="header__mark"
            width="36"
            height="36"
          >
          <span class="header__wordmark">
            <span class="header__name">Kainku</span>
            <span class="header__tagline">{{ t('common.tagline') }}</span>
          </span>
        </NuxtLink>

        <nav class="header__nav" :aria-label="t('common.mainNav')">
          <NuxtLink
            v-for="link in primary"
            :key="link.to"
            :to="localePath(link.to)"
            class="header__link"
          >
            {{ t(link.labelKey) }}
          </NuxtLink>
        </nav>

        <div class="header__actions">
          <LocaleSwitcher class="u-hide-mobile" />

          <button
            type="button"
            class="header__icon-btn"
            :aria-label="t('common.search')"
            @click="ui.openSearch()"
          >
            <BaseIcon name="search" />
          </button>

          <button
            type="button"
            class="header__icon-btn"
            :aria-label="t('cart.openLabel', { count: cart.itemCount })"
            @click="cart.openDrawer()"
          >
            <BaseIcon name="cart" />
            <ClientOnly>
              <span v-if="cart.itemCount > 0" class="header__cart-count">{{ cart.itemCount }}</span>
            </ClientOnly>
          </button>

          <button
            type="button"
            class="header__icon-btn header__burger"
            :aria-label="ui.isMenuOpen ? t('common.closeMenu') : t('common.openMenu')"
            :aria-expanded="ui.isMenuOpen"
            aria-controls="mobile-menu"
            @click="ui.toggleMenu()"
          >
            <span class="burger" :data-open="ui.isMenuOpen" aria-hidden="true">
              <span /><span /><span />
            </span>
          </button>
        </div>
      </div>
    </header>

    <MobileMenu />
  </div>
</template>
