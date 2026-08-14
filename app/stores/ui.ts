import { defineStore } from 'pinia'

/**
 * Cross-cutting interface state: the mobile menu, the search overlay and the
 * body scroll lock they share.
 *
 * The lock is reference-counted because two overlays can legitimately be open
 * at once (search opened from inside the mobile menu); a naive boolean would
 * unlock the page as soon as either one closed.
 */
export const useUiStore = defineStore('ui', {
  state: () => ({
    isMenuOpen: false,
    isSearchOpen: false,
    scrollLocks: 0,
  }),

  getters: {
    isScrollLocked: (state) => state.scrollLocks > 0,
  },

  actions: {
    lockScroll() {
      this.scrollLocks += 1
      this.applyScrollLock()
    },

    unlockScroll() {
      this.scrollLocks = Math.max(0, this.scrollLocks - 1)
      this.applyScrollLock()
    },

    /**
     * Toggles the class the stylesheet keys off. Padding compensation for the
     * scrollbar is handled in CSS via `scrollbar-gutter`, so nothing is written
     * to `element.style` here — the project keeps all styling in stylesheets.
     */
    applyScrollLock() {
      if (typeof document === 'undefined') return
      document.documentElement.classList.toggle('is-scroll-locked', this.scrollLocks > 0)
    },

    openMenu() {
      if (this.isMenuOpen) return
      this.isMenuOpen = true
      this.lockScroll()
    },

    closeMenu() {
      if (!this.isMenuOpen) return
      this.isMenuOpen = false
      this.unlockScroll()
    },

    toggleMenu() {
      this.isMenuOpen ? this.closeMenu() : this.openMenu()
    },

    openSearch() {
      if (this.isSearchOpen) return
      this.isSearchOpen = true
      this.lockScroll()
    },

    closeSearch() {
      if (!this.isSearchOpen) return
      this.isSearchOpen = false
      this.unlockScroll()
    },

    /** Closes every overlay — used on route change. */
    closeAll() {
      this.closeMenu()
      this.closeSearch()
    },
  },
})
