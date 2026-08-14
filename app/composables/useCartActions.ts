import { useCartStore } from '~/stores/cart'
import type { Product } from '~/types/product'
import { formatMeters } from '~/utils/format'

/**
 * Add-to-cart with the user feedback attached.
 *
 * Components call this rather than the store directly so the toast, the drawer
 * and the sold-out guard behave identically everywhere (card, PDP, quick add).
 */
export function useCartActions() {
  const cart = useCartStore()
  const { push } = useToast()
  const { t, locale } = useI18n()
  const localePath = useLocalePath()
  const { nameOf } = useProductContent()

  /**
   * @param product The item to add.
   * @param meters  Quantity in metres; defaults to the product's minimum.
   * @param options `openDrawer` slides the basket out (used by the PDP button).
   */
  function addToCart(product: Product, meters?: number, options: { openDrawer?: boolean } = {}) {
    if (product.stockMeters <= 0) {
      push(t('cart.toast.soldOut', { name: nameOf(product) }), 'error')
      return false
    }

    const total = cart.add(product, meters ?? product.minOrderMeters)
    if (total <= 0) {
      push(t('cart.toast.failed'), 'error')
      return false
    }

    push(
      t('cart.toast.added', {
        name: nameOf(product),
        meters: formatMeters(total, locale.value === 'id' ? 'id-ID' : 'en-US'),
      }),
      'success',
      { label: t('cart.toast.viewCart'), to: localePath('/keranjang') },
    )

    if (options.openDrawer) cart.openDrawer()
    return true
  }

  function removeFromCart(productId: string, name: string) {
    cart.remove(productId)
    push(t('cart.toast.removed', { name }), 'info')
  }

  return { cart, addToCart, removeFromCart }
}
