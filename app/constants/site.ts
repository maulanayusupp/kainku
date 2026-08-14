/**
 * Single source of truth for brand-level constants.
 * Imported by nuxt.config.ts (build time) and by app code (runtime),
 * so it must stay free of Nuxt-only imports.
 */
export const SITE = {
  name: 'Kainku',
  /** Canonical origin. Override per-environment via NUXT_PUBLIC_SITE_URL. */
  url: 'https://kainku.vercel.app',
  defaultLocale: 'id',
  contactEmail: 'maulanayusupp@gmail.com',
  owner: 'Maulana Yusup Abdullah',
  whatsapp: '',
  currency: 'IDR',
  locale: 'id-ID',
} as const

export const LOCALES = ['id', 'en'] as const
export type LocaleCode = (typeof LOCALES)[number]
