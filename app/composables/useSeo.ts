import { SITE } from '~/constants/site'

export interface SeoInput {
  /** Page title WITHOUT the brand suffix — the template appends it. */
  title: string
  description: string
  /** Absolute or root-relative image path. Defaults to the brand social card. */
  image?: string
  /** `article` for editorial pages, `product` for PDPs. */
  type?: 'website' | 'article' | 'product'
  /** Set `true` on thin or transactional pages (checkout, search results). */
  noindex?: boolean
  /** Extra JSON-LD graph nodes to merge into the page. */
  jsonLd?: Record<string, unknown>[]
}

/**
 * Applies title, description, Open Graph, Twitter and canonical tags, plus
 * hreflang alternates for every configured locale.
 *
 * `useLocaleHead()` from @nuxtjs/i18n already emits `<html lang>`, canonical and
 * the alternate links; this wraps it so a page only has to describe itself once.
 */
export function useSeo(input: MaybeRefOrGetter<SeoInput>) {
  const config = useRuntimeConfig()
  const { t, locale } = useI18n()
  const route = useRoute()

  const siteUrl = (config.public.siteUrl as string) || SITE.url
  const localeHead = useLocaleHead({ seo: true })

  const resolved = computed(() => toValue(input))

  const absoluteUrl = computed(() => `${siteUrl.replace(/\/$/, '')}${route.path}`)

  /**
   * Absolute URL of the preview image.
   *
   * Social scrapers (WhatsApp, Instagram, Facebook, Telegram) all require an
   * ABSOLUTE url and a RASTER format — none of them render SVG, so a page that
   * hands them a `.svg` gets a preview with no image at all. Anything passed in
   * must therefore be a PNG/JPEG; `og-default.png` is the fallback.
   */
  const imageUrl = computed(() => {
    const image = resolved.value.image ?? '/images/brand/og-default.png'
    if (import.meta.dev && /\.svgz?($|\?)/i.test(image)) {
      console.warn(
        `[useSeo] og:image "${image}" is an SVG. WhatsApp, Instagram and Facebook ` +
          'will show no preview image. Point this at a PNG instead.',
      )
    }
    return image.startsWith('http') ? image : `${siteUrl.replace(/\/$/, '')}${image}`
  })

  useHead(() => ({
    htmlAttrs: localeHead.value.htmlAttrs,
    link: [
      ...(localeHead.value.link ?? []),
      { rel: 'canonical', href: absoluteUrl.value },
    ],
    meta: localeHead.value.meta ?? [],
  }))

  useSeoMeta({
    title: () => resolved.value.title,
    titleTemplate: (title) => (title ? `${title} · ${SITE.name}` : t('seo.defaultTitle')),
    description: () => resolved.value.description,

    ogType: () => (resolved.value.type === 'product' ? 'website' : (resolved.value.type ?? 'website')),
    ogTitle: () => `${resolved.value.title} · ${SITE.name}`,
    ogDescription: () => resolved.value.description,
    ogUrl: () => absoluteUrl.value,
    ogImage: () => imageUrl.value,
    // WhatsApp reads `og:image:secure_url` in preference to `og:image`, and
    // several scrapers skip an image whose type/dimensions are not declared.
    ogImageSecureUrl: () => imageUrl.value,
    ogImageType: 'image/png',
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: () => resolved.value.title,
    ogSiteName: SITE.name,
    ogLocale: () => (locale.value === 'id' ? 'id_ID' : 'en_US'),
    // Lets Facebook/WhatsApp know the page exists in the other language too.
    ogLocaleAlternate: () => (locale.value === 'id' ? 'en_US' : 'id_ID'),

    twitterCard: 'summary_large_image',
    twitterTitle: () => `${resolved.value.title} · ${SITE.name}`,
    twitterDescription: () => resolved.value.description,
    twitterImage: () => imageUrl.value,

    robots: () =>
      resolved.value.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
  })

  // Structured data. Always includes the organisation + website nodes so search
  // engines can associate every page with the brand.
  useHead(() => {
    const graph: Record<string, unknown>[] = [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: SITE.name,
        url: siteUrl,
        logo: `${siteUrl}/images/brand/logo-mark.svg`,
        email: config.public.contactEmail,
        founder: { '@type': 'Person', name: SITE.owner },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE.name,
        inLanguage: locale.value === 'id' ? 'id-ID' : 'en-US',
        publisher: { '@id': `${siteUrl}/#organization` },
      },
      ...(resolved.value.jsonLd ?? []),
    ]

    return {
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }),
        },
      ],
    }
  })

  return { absoluteUrl, imageUrl }
}

/** Builds a BreadcrumbList node for `useSeo({ jsonLd: [...] })`. */
export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
  siteUrl: string,
): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl.replace(/\/$/, '')}${item.path}`,
    })),
  }
}
