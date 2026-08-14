/**
 * Reveals `[data-reveal]` elements as they scroll into view.
 *
 * Design constraints this satisfies:
 *  - Content is visible without JavaScript. The hidden state is scoped to
 *    `.js-enabled`, a class only added once this runs (see `plugins/reveal.client.ts`).
 *  - Users who prefer reduced motion get everything revealed immediately.
 *  - One shared IntersectionObserver per page, not one per element.
 */
export function useScrollReveal(options: { threshold?: number; rootMargin?: string } = {}) {
  const { threshold = 0.12, rootMargin = '0px 0px -8% 0px' } = options

  let observer: IntersectionObserver | null = null

  const revealAll = () => {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'))
  }

  const observe = () => {
    if (typeof window === 'undefined') return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || !('IntersectionObserver' in window)) {
      revealAll()
      return
    }

    observer?.disconnect()
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-revealed')
          // Reveal is one-way; stop watching so we do no further work.
          observer?.unobserve(entry.target)
        }
      },
      { threshold, rootMargin },
    )

    document
      .querySelectorAll('[data-reveal]:not(.is-revealed)')
      .forEach((el) => observer?.observe(el))
  }

  onMounted(() => nextTick(observe))
  onBeforeUnmount(() => observer?.disconnect())

  // Re-scan after client-side navigation, once the new DOM is in place.
  const router = useRouter()
  const stop = router.afterEach(() => nextTick(observe))
  onBeforeUnmount(stop)

  return { observe, revealAll }
}
