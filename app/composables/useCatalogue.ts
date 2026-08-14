import {
  PRICE_BOUNDS,
  filterProducts,
  getAllProducts,
  getFacets,
  sortProducts,
} from '~/services/product.service'
import type {
  ColorFamily,
  MaterialKey,
  ProductCategory,
  ProductFilters,
  ProductSort,
} from '~/types/product'
import { EMPTY_FILTERS } from '~/types/product'
import { toggle } from '~/utils/collection'

const SORTS: ProductSort[] = ['featured', 'newest', 'price-asc', 'price-desc', 'name-asc']

/** Reads a repeatable query param into a typed array, dropping unknown values. */
function readList<T extends string>(raw: unknown, allowed: readonly T[]): T[] {
  const values = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(',') : []
  return values.filter((value): value is T => allowed.includes(value as T))
}

function readNumber(raw: unknown): number | undefined {
  const parsed = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isFinite(parsed) ? parsed : undefined
}

/**
 * Catalogue browsing state.
 *
 * Filters live in the URL query rather than in local component state, so a
 * filtered view can be bookmarked, shared and restored by the back button.
 * Everything below derives from `route.query`; `apply()` is the only writer.
 */
export function useCatalogue() {
  const route = useRoute()
  const router = useRouter()
  const { searchIndexFor, nameOf, locale } = useProductContent()

  const allProducts = getAllProducts()

  const filters = computed<ProductFilters>(() => ({
    ...EMPTY_FILTERS,
    categories: readList<ProductCategory>(route.query.kategori, [
      'batik',
      'tenun',
      'songket',
      'jumputan',
    ]),
    materials: readList<MaterialKey>(route.query.bahan, ['katun', 'sutra', 'rayon', 'metalik']),
    colors: readList<ColorFamily>(route.query.warna, [
      'indigo',
      'biru',
      'merah',
      'emas',
      'tanah',
      'hijau',
      'ungu',
      'netral',
    ]),
    minPrice: readNumber(route.query.min),
    maxPrice: readNumber(route.query.max),
    query: typeof route.query.q === 'string' ? route.query.q : '',
    inStockOnly: route.query.stok === '1',
  }))

  const sort = computed<ProductSort>(() => {
    const raw = route.query.urut
    return SORTS.includes(raw as ProductSort) ? (raw as ProductSort) : 'featured'
  })

  const results = computed(() => {
    const filtered = filterProducts(allProducts, filters.value, searchIndexFor)
    return sortProducts(filtered, sort.value, nameOf, locale.value)
  })

  /** Facets are counted over the whole catalogue so counts never hit zero-all. */
  const facets = computed(() => getFacets(allProducts))

  const activeFilterCount = computed(() => {
    const f = filters.value
    return (
      f.categories.length +
      f.materials.length +
      f.colors.length +
      (f.query.trim() ? 1 : 0) +
      (f.inStockOnly ? 1 : 0) +
      (f.minPrice != null || f.maxPrice != null ? 1 : 0)
    )
  })

  const hasResults = computed(() => results.value.length > 0)

  /**
   * Merges a partial change into the URL query.
   * Empty arrays and blank strings are removed so the URL stays clean.
   */
  function apply(patch: Partial<ProductFilters> & { sort?: ProductSort }) {
    const next: Record<string, string | undefined> = { ...(route.query as Record<string, string>) }

    const setList = (key: string, value?: string[]) => {
      if (value === undefined) return
      next[key] = value.length ? value.join(',') : undefined
    }

    setList('kategori', patch.categories)
    setList('bahan', patch.materials)
    setList('warna', patch.colors)

    if (patch.query !== undefined) next.q = patch.query.trim() || undefined
    if (patch.inStockOnly !== undefined) next.stok = patch.inStockOnly ? '1' : undefined
    if (patch.minPrice !== undefined)
      next.min = patch.minPrice > PRICE_BOUNDS.min ? String(patch.minPrice) : undefined
    if (patch.maxPrice !== undefined)
      next.max = patch.maxPrice < PRICE_BOUNDS.max ? String(patch.maxPrice) : undefined
    if (patch.sort !== undefined) next.urut = patch.sort === 'featured' ? undefined : patch.sort

    router.push({ query: next })
  }

  const toggleCategory = (value: ProductCategory) =>
    apply({ categories: toggle(filters.value.categories, value) })

  const toggleMaterial = (value: MaterialKey) =>
    apply({ materials: toggle(filters.value.materials, value) })

  const toggleColor = (value: ColorFamily) => apply({ colors: toggle(filters.value.colors, value) })

  const setSort = (value: ProductSort) => apply({ sort: value })

  const setQuery = (value: string) => apply({ query: value })

  const setPriceRange = (min: number, max: number) => apply({ minPrice: min, maxPrice: max })

  const toggleInStock = () => apply({ inStockOnly: !filters.value.inStockOnly })

  function reset() {
    router.push({ query: {} })
  }

  return {
    filters,
    sort,
    results,
    facets,
    hasResults,
    activeFilterCount,
    priceBounds: PRICE_BOUNDS,
    sortOptions: SORTS,
    apply,
    toggleCategory,
    toggleMaterial,
    toggleColor,
    toggleInStock,
    setSort,
    setQuery,
    setPriceRange,
    reset,
  }
}
