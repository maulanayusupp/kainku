import type { LocalizedProduct, Product } from '~/types/product'

/**
 * Joins a `Product` record with its copy for the active locale.
 *
 * Product text lives in `i18n/locales/<locale>.json` under `products.<slug>`,
 * which keeps `app/data/products.ts` language-neutral and means adding a third
 * language never touches the catalogue data.
 */
export function useProductContent() {
  const { t, tm, rt, locale } = useI18n()

  /** Reads a message array (care instructions, "best for" list) safely. */
  const list = (key: string): string[] => {
    const raw = tm(key) as unknown
    if (!Array.isArray(raw)) return []
    return raw
      .map((entry) => (typeof entry === 'string' ? entry : rt(entry as Parameters<typeof rt>[0])))
      .filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
  }

  /** Localizes one product. */
  const localize = (product: Product): LocalizedProduct => {
    const base = `products.${product.slug}`
    return {
      ...product,
      name: t(`${base}.name`),
      tagline: t(`${base}.tagline`),
      description: t(`${base}.description`),
      story: t(`${base}.story`),
      care: list(`${base}.care`),
      bestFor: list(`${base}.bestFor`),
    }
  }

  const localizeAll = (products: Product[]): LocalizedProduct[] => products.map(localize)

  /** Just the name — cheaper than building the whole object for sort/search. */
  const nameOf = (product: Product): string => t(`products.${product.slug}.name`)

  /** The text the catalogue search matches against. */
  const searchIndexFor = (product: Product): string =>
    [
      nameOf(product),
      t(`products.${product.slug}.tagline`),
      product.region,
      t(`catalogue.category.${product.category}`),
      ...product.materials.map((material) => t(`catalogue.material.${material}`)),
    ].join(' ')

  /** Alt text for a product image, describing which view it is. */
  const altFor = (product: Product, viewKey: string): string =>
    t(`product.imageAlt.${viewKey}`, { name: nameOf(product) })

  return { localize, localizeAll, nameOf, searchIndexFor, altFor, locale }
}
