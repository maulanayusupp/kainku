import { useCartStore } from '~/stores/cart'
import { useUiStore } from '~/stores/ui'

/**
 * Client-only bootstrap.
 *
 *  1. Marks the document as JS-capable, which is what arms the scroll-reveal
 *     hidden state. Without this the content is simply always visible.
 *  2. Hydrates the persisted cart AFTER the first render, so the server HTML
 *     and the initial client render agree (no hydration mismatch).
 *  3. Closes any open overlay on navigation.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const cart = useCartStore()
  const ui = useUiStore()

  document.documentElement.classList.add('js-enabled')

  nuxtApp.hook('app:suspense:resolve', () => {
    cart.hydrate()
  })

  const router = useRouter()
  router.afterEach(() => {
    ui.closeAll()
    cart.closeDrawer()
  })
})
