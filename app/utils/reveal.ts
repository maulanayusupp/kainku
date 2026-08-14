/**
 * Scroll-reveal controller — pure DOM, no Vue and no Nuxt imports.
 *
 * Kept framework-free so it can be exercised directly in a DOM harness
 * (`scripts/test-reveal.mjs`). `useScrollReveal()` is only a lifecycle wrapper
 * around this.
 *
 * ## The failure this is built to prevent
 *
 * Reveal targets start at `opacity: 0` (see `base/_animations.scss`), so an
 * element the controller never registers does not merely lose its animation —
 * it stays invisible. On a page where every section is a reveal target that
 * reads as a completely blank page.
 *
 * The original implementation re-scanned on `router.afterEach`. That is too
 * early: with `pageTransition: { mode: 'out-in' }` the incoming page mounts
 * only after the outgoing one has finished leaving, so the scan ran against a
 * DOM that did not yet contain the new route. Hence: blank on client-side
 * navigation, correct after a reload.
 *
 * Two independent guards replace it:
 *   1. A MutationObserver — fires when the new DOM actually lands, and cannot
 *      be out-raced by a transition of any duration.
 *   2. A timed failsafe — anything already inside the viewport is revealed
 *      even if the IntersectionObserver never delivers. Below-the-fold
 *      elements are left alone so the scroll effect is preserved.
 */

export interface RevealOptions {
  threshold?: number
  rootMargin?: string
  /** Delay before on-screen stragglers are force-revealed. */
  failsafeMs?: number
  /** Container to watch. Defaults to `#main`, falling back to `<body>`. */
  getRoot?: () => Element
}

export interface RevealController {
  /** Begins observing. Safe to call once. */
  start: () => void
  /** Registers any targets rendered since the last scan. Idempotent. */
  scan: () => void
  /** Reveals every outstanding target immediately. */
  revealAll: () => void
  /** Reveals only targets already within the viewport. */
  revealVisible: () => void
  /** Tears down every observer and timer. */
  stop: () => void
}

export const REVEAL_SELECTOR = '[data-reveal]:not(.is-revealed)'

export function createRevealController(options: RevealOptions = {}): RevealController {
  const {
    threshold = 0.12,
    rootMargin = '0px 0px -8% 0px',
    failsafeMs = 1200,
    getRoot = () => document.getElementById('main') ?? document.body,
  } = options

  let intersection: IntersectionObserver | null = null
  let mutation: MutationObserver | null = null
  let frame = 0
  let failsafe: ReturnType<typeof setTimeout> | undefined
  let started = false

  const pending = (): Element[] => Array.from(getRoot().querySelectorAll(REVEAL_SELECTOR))

  const reveal = (el: Element) => el.classList.add('is-revealed')

  const revealAll = () => pending().forEach(reveal)

  const revealVisible = () => {
    const height = window.innerHeight || document.documentElement.clientHeight || 0
    for (const el of pending()) {
      if (el.getBoundingClientRect().top < height) reveal(el)
    }
  }

  const scan = () => {
    // No IntersectionObserver (unsupported, or reduced motion): show everything.
    if (!intersection) {
      revealAll()
      return
    }

    for (const el of pending()) intersection.observe(el)

    clearTimeout(failsafe)
    failsafe = setTimeout(revealVisible, failsafeMs)
  }

  /** Coalesces bursts of mutations into at most one scan per frame. */
  const scheduleScan = () => {
    if (frame) return
    const raf =
      typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame
        : (cb: FrameRequestCallback) => setTimeout(() => cb(0), 16) as unknown as number
    frame = raf(() => {
      frame = 0
      scan()
    }) as unknown as number
  }

  const start = () => {
    if (started) return
    started = true

    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReduced && typeof IntersectionObserver === 'function') {
      intersection = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            reveal(entry.target)
            // Reveal is one-way; stop watching so we do no further work.
            intersection?.unobserve(entry.target)
          }
        },
        { threshold, rootMargin },
      )
    }

    scan()

    if (typeof MutationObserver === 'function') {
      mutation = new MutationObserver(scheduleScan)
      mutation.observe(getRoot(), { childList: true, subtree: true })
    }
  }

  const stop = () => {
    started = false
    if (frame && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame)
    frame = 0
    clearTimeout(failsafe)
    intersection?.disconnect()
    intersection = null
    mutation?.disconnect()
    mutation = null
  }

  return { start, scan, revealAll, revealVisible, stop }
}
