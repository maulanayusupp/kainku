/**
 * The site's navigation model.
 *
 * Defined once and consumed by the header, the mobile menu, the footer and the
 * legal sidebar, so a new page is added to every navigation surface by editing
 * this file alone. Labels are i18n keys, never literal text.
 */
export interface NavLink {
  /** i18n key for the visible label. */
  labelKey: string
  /** Route path in its ID (default-locale) form; `localePath()` handles the rest. */
  to: string
}

export function useNavigation() {
  const primary: NavLink[] = [
    { labelKey: 'nav.catalogue', to: '/katalog' },
    { labelKey: 'nav.collections', to: '/koleksi' },
    { labelKey: 'nav.about', to: '/tentang' },
    { labelKey: 'nav.faq', to: '/faq' },
    { labelKey: 'nav.contact', to: '/kontak' },
  ]

  const shop: NavLink[] = [
    { labelKey: 'nav.catalogue', to: '/katalog' },
    { labelKey: 'nav.collections', to: '/koleksi' },
    { labelKey: 'nav.cart', to: '/keranjang' },
    { labelKey: 'nav.sizeGuide', to: '/panduan-ukuran' },
  ]

  const company: NavLink[] = [
    { labelKey: 'nav.about', to: '/tentang' },
    { labelKey: 'nav.contact', to: '/kontak' },
    { labelKey: 'nav.faq', to: '/faq' },
    { labelKey: 'nav.compliance', to: '/legal' },
  ]

  /** Order matters — this drives the sidebar on every legal page. */
  const legal: NavLink[] = [
    { labelKey: 'nav.legal.overview', to: '/legal' },
    { labelKey: 'nav.legal.privacy', to: '/legal/privasi' },
    { labelKey: 'nav.legal.terms', to: '/legal/ketentuan' },
    { labelKey: 'nav.legal.shipping', to: '/legal/pengiriman' },
    { labelKey: 'nav.legal.returns', to: '/legal/pengembalian' },
    { labelKey: 'nav.legal.cookies', to: '/legal/cookie' },
    { labelKey: 'nav.legal.accessibility', to: '/legal/aksesibilitas' },
    { labelKey: 'nav.legal.disclaimer', to: '/legal/disclaimer' },
  ]

  return { primary, shop, company, legal }
}
