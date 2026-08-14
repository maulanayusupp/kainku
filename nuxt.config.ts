// https://nuxt.com/docs/api/configuration/nuxt-config
import { SITE } from './app/constants/site'

export default defineNuxtConfig({
  compatibilityDate: '2025-11-01',
  future: { compatibilityVersion: 4 },

  devtools: { enabled: true },

  modules: [
    '@nuxt/fonts',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ],

  css: ['~/assets/scss/main.scss'],

  // Flat component names: `components/base/BaseIcon.vue` is `<BaseIcon>`, not
  // `<BaseBaseIcon>`. Filenames must therefore be unique across the tree — the
  // sub-folders exist to organise the source, not to namespace the tags.
  components: [{ path: '~/components', pathPrefix: false }],

  site: {
    url: SITE.url,
    name: SITE.name,
    defaultLocale: SITE.defaultLocale,
  },

  runtimeConfig: {
    // Server-only. Override with NUXT_CONTACT_INBOX at deploy time.
    contactInbox: SITE.contactEmail,
    public: {
      siteUrl: SITE.url,
      siteName: SITE.name,
      contactEmail: SITE.contactEmail,
      whatsapp: SITE.whatsapp,
      currency: SITE.currency,
    },
  },

  i18n: {
    // ID is the default and is served without a prefix (rule: default = ID).
    defaultLocale: 'id',
    strategy: 'prefix_except_default',
    // v10 lazy-loads message files by default; there is no `lazy` flag any more.
    langDir: 'locales',
    // Split per concern so a translator can work on one area at a time and
    // merge conflicts stay small. `npm run i18n:check` asserts ID and EN expose
    // exactly the same key set.
    locales: [
      {
        code: 'id',
        language: 'id-ID',
        name: 'Bahasa Indonesia',
        dir: 'ltr',
        files: ['id/common.json', 'id/shop.json', 'id/products.json', 'id/legal.json'],
      },
      {
        code: 'en',
        language: 'en-US',
        name: 'English',
        dir: 'ltr',
        files: ['en/common.json', 'en/shop.json', 'en/products.json', 'en/legal.json'],
      },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'kainku_locale',
      alwaysRedirect: false,
      redirectOn: 'root',
      fallbackLocale: 'id',
    },
    baseUrl: SITE.url,
  },

  fonts: {
    // Self-hosted at build time; falls back to the system stack if unavailable.
    families: [
      { name: 'Fraunces', provider: 'google', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] },
      { name: 'Plus Jakarta Sans', provider: 'google', weights: [300, 400, 500, 600, 700] },
    ],
    defaults: { fallbacks: { serif: ['Georgia'], 'sans-serif': ['Helvetica Neue'] } },
  },

  sitemap: {
    // Product/collection URLs are contributed by server/api/__sitemap__/urls.ts
    sources: ['/api/__sitemap__/urls'],
    // Transactional pages carry `noindex`; keeping them out of the sitemap too
    // avoids sending search engines a contradictory signal.
    exclude: ['/checkout', '/checkout/**', '/keranjang', '/**/checkout', '/**/keranjang'],
    defaults: { changefreq: 'weekly', priority: 0.7 },
  },

  robots: {
    // The module localises these itself — listing `/en/...` here would emit a
    // duplicate rule. The Sitemap line is also added automatically and points
    // at sitemap_index.xml (the real index; /sitemap.xml is only a redirect).
    disallow: ['/checkout', '/keranjang'],
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: { silenceDeprecations: ['import'] },
      },
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0E1729' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  nitro: {
    prerender: { crawlLinks: true, routes: ['/', '/en'], failOnError: false },
  },

  typescript: { strict: true, typeCheck: false },
})
