import { createRevealController, type RevealOptions } from '~/utils/reveal'

/**
 * Wires the scroll-reveal controller to the component lifecycle.
 *
 * All DOM behaviour lives in `~/utils/reveal` so it can be tested headlessly
 * (`npm run test:reveal`); this file only decides *when* it runs.
 *
 * Called from the default layout, which mounts exactly once — so `onMounted`
 * never fires again during client-side navigation. The controller's own
 * MutationObserver is what keeps later routes working; `page:finish` is a
 * second, independent trigger.
 */
export function useScrollReveal(options: RevealOptions = {}) {
  const nuxtApp = useNuxtApp()
  const controller = createRevealController(options)

  onMounted(() => controller.start())

  const offPageFinish = nuxtApp.hook('page:finish', () => controller.scan())

  onBeforeUnmount(() => {
    offPageFinish()
    controller.stop()
  })

  return controller
}
