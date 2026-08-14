import { PRODUCTS } from '~/data/products'
import { CATEGORIES } from '~/services/product.service'

/**
 * Dynamic sitemap entries.
 *
 * Static pages are discovered by @nuxtjs/sitemap from the file-based routes;
 * this route contributes the URLs it cannot know about — one per product and
 * one per collection — with the ID/EN alternates attached so search engines
 * see the pairs.
 */
export default defineSitemapEventHandler(() => {
  const productUrls = PRODUCTS.map((product) => ({
    loc: `/produk/${product.slug}`,
    lastmod: product.addedAt,
    changefreq: 'weekly' as const,
    priority: 0.8 as const,
    _i18nTransform: true,
    images: product.images.slice(0, 1).map((image) => ({ loc: image.src })),
  }))

  const collectionUrls = CATEGORIES.map((category) => ({
    loc: `/koleksi/${category}`,
    changefreq: 'weekly' as const,
    priority: 0.7 as const,
    _i18nTransform: true,
  }))

  return [...productUrls, ...collectionUrls]
})
