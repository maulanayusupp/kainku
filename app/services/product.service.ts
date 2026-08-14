import { PRICE_BOUNDS, PRODUCTS } from '~/data/products'
import type {
  ColorFamily,
  FacetCount,
  MaterialKey,
  Product,
  ProductCategory,
  ProductFilters,
  ProductSort,
} from '~/types/product'
import { countBy, intersects, matchesQuery, sortBy } from '~/utils/collection'

/**
 * Catalogue access.
 *
 * Today this reads a static array. It is written as a service so that swapping
 * in a real backend later is a single-file change: make these functions async,
 * hit the API, and every caller (`useCatalogue`, the sitemap route, the product
 * page) keeps working. Nothing outside this file imports `~/data/products`
 * except the sitemap source, which needs the slugs at build time.
 */

export const CATEGORIES: ProductCategory[] = ['batik', 'tenun', 'songket', 'jumputan']
export const MATERIALS: MaterialKey[] = ['katun', 'sutra', 'rayon', 'metalik']
export const COLORS: ColorFamily[] = [
  'indigo',
  'biru',
  'merah',
  'emas',
  'tanah',
  'hijau',
  'ungu',
  'netral',
]

export const SORT_OPTIONS: ProductSort[] = [
  'featured',
  'newest',
  'price-asc',
  'price-desc',
  'name-asc',
]

/** Every product, in catalogue order. */
export function getAllProducts(): Product[] {
  return PRODUCTS
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug)
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id)
}

export function getFeaturedProducts(limit = 6): Product[] {
  return PRODUCTS.filter((product) => product.featured).slice(0, limit)
}

export function getNewestProducts(limit = 4): Product[] {
  return sortBy(PRODUCTS, (a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, limit)
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCTS.filter((product) => product.category === category)
}

/**
 * Products related to `slug`: same category first, then anything sharing a
 * colour family, so the rail is never empty even for a one-item category.
 */
export function getRelatedProducts(slug: string, limit = 4): Product[] {
  const current = getProductBySlug(slug)
  if (!current) return []

  const others = PRODUCTS.filter((product) => product.slug !== slug)
  const scored = others.map((product) => {
    let score = 0
    if (product.category === current.category) score += 4
    if (intersects(product.colors, current.colors)) score += 2
    if (intersects(product.materials, current.materials)) score += 1
    if (product.region === current.region) score += 2
    return { product, score }
  })

  return sortBy(scored, (a, b) => b.score - a.score || a.product.id.localeCompare(b.product.id))
    .slice(0, limit)
    .map((entry) => entry.product)
}

/** `true` when the filter set would not narrow anything down. */
export function isDefaultFilters(filters: ProductFilters): boolean {
  return (
    filters.categories.length === 0 &&
    filters.materials.length === 0 &&
    filters.colors.length === 0 &&
    !filters.query.trim() &&
    !filters.inStockOnly &&
    (filters.minPrice ?? PRICE_BOUNDS.min) <= PRICE_BOUNDS.min &&
    (filters.maxPrice ?? PRICE_BOUNDS.max) >= PRICE_BOUNDS.max
  )
}

/**
 * Applies the filter set.
 *
 * `searchIndex` supplies the localized text to match the free-text query
 * against. It is passed in rather than imported so this stays locale-agnostic:
 * the caller (which has access to `useI18n`) decides what "name" means.
 *
 * @param products    Source list.
 * @param filters     Active filters.
 * @param searchIndex Maps a product id to its searchable localized string.
 */
export function filterProducts(
  products: Product[],
  filters: ProductFilters,
  searchIndex: (product: Product) => string = (product) => `${product.slug} ${product.region}`,
): Product[] {
  return products.filter((product) => {
    if (filters.categories.length && !filters.categories.includes(product.category)) return false
    if (filters.materials.length && !intersects(product.materials, filters.materials)) return false
    if (filters.colors.length && !intersects(product.colors, filters.colors)) return false
    if (filters.inStockOnly && product.stockMeters <= 0) return false
    if (filters.minPrice != null && product.pricePerMeter < filters.minPrice) return false
    if (filters.maxPrice != null && product.pricePerMeter > filters.maxPrice) return false
    if (filters.query.trim() && !matchesQuery(searchIndex(product), filters.query)) return false
    return true
  })
}

/**
 * Sorts a product list. `nameOf` supplies the localized name so `name-asc`
 * collates correctly in the active language.
 */
export function sortProducts(
  products: Product[],
  sort: ProductSort,
  nameOf: (product: Product) => string = (product) => product.slug,
  locale = 'id',
): Product[] {
  switch (sort) {
    case 'price-asc':
      return sortBy(products, (a, b) => a.pricePerMeter - b.pricePerMeter)
    case 'price-desc':
      return sortBy(products, (a, b) => b.pricePerMeter - a.pricePerMeter)
    case 'newest':
      return sortBy(products, (a, b) => b.addedAt.localeCompare(a.addedAt))
    case 'name-asc':
      return sortBy(products, (a, b) => nameOf(a).localeCompare(nameOf(b), locale))
    case 'featured':
    default:
      // Featured first, then the in-stock items, then catalogue order.
      return sortBy(
        products,
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          Number(b.stockMeters > 0) - Number(a.stockMeters > 0) ||
          a.id.localeCompare(b.id),
      )
  }
}

/** Facet counts for the given result set, so the UI can show "Batik (3)". */
export function getFacets(products: Product[]): {
  categories: FacetCount<ProductCategory>[]
  materials: FacetCount<MaterialKey>[]
  colors: FacetCount<ColorFamily>[]
} {
  const categoryCounts = countBy(products, (product) => product.category)
  const materialCounts = countBy(products, (product) => product.materials)
  const colorCounts = countBy(products, (product) => product.colors)

  return {
    categories: CATEGORIES.map((value) => ({ value, count: categoryCounts[value] ?? 0 })),
    materials: MATERIALS.map((value) => ({ value, count: materialCounts[value] ?? 0 })),
    colors: COLORS.map((value) => ({ value, count: colorCounts[value] ?? 0 })),
  }
}

export { PRICE_BOUNDS }
