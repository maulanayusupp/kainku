/**
 * Artwork specification for the 12 catalogue items.
 *
 * This file only describes how each swatch is DRAWN. Commercial data (price,
 * stock, copy) lives in `app/data/products.ts`, and the human-readable strings
 * live in `i18n/locales/*.json`. The three are joined by `slug`, and
 * `npm run check` verifies they stay in sync.
 *
 * `palette` names must also exist in `app/assets/scss/components/_swatch.scss`
 * so the UI can tint product surfaces without inline styles.
 */

export const CATALOG = [
  {
    slug: 'batik-tulis-parang-barong',
    motif: 'parang',
    palette: 'indigo-kapas',
    colors: { base: '#16233f', motif: '#e8dcc4', highlight: '#c9a227', accent: '#7a4b2e' },
  },
  {
    slug: 'tenun-ikat-sumba-tanah',
    motif: 'ikat',
    palette: 'tanah-sumba',
    colors: { base: '#6b2f22', motif: '#e5d3b3', highlight: '#d9a441', accent: '#2f4739' },
  },
  {
    slug: 'songket-palembang-lepus',
    motif: 'songket',
    palette: 'merah-emas',
    colors: { base: '#6d1226', motif: '#c9a227', highlight: '#f6e3a1', accent: '#3d0a16' },
    foil: ['#7d5f12', '#f9ecc0', '#d9b23c'],
  },
  {
    slug: 'batik-mega-mendung-cirebon',
    motif: 'megaMendung',
    palette: 'biru-mendung',
    colors: { base: '#0b2c53', motif: '#1f6bb0', highlight: '#8fd0ee', accent: '#3f92cf' },
  },
  {
    slug: 'lurik-yogya-klasik',
    motif: 'lurik',
    palette: 'lurik-natural',
    colors: { base: '#e3d9c6', motif: '#3a3226', highlight: '#8c7856', accent: '#a8452e' },
  },
  {
    slug: 'ulos-batak-ragidup',
    motif: 'ulos',
    palette: 'ulos-ragi',
    colors: { base: '#1a1614', motif: '#9c1f22', highlight: '#e8e0d2', accent: '#d4a017' },
  },
  {
    slug: 'tenun-endek-bali-giri',
    motif: 'endek',
    palette: 'giri-jade',
    colors: { base: '#0d4f4a', motif: '#e8c766', highlight: '#f6ecd0', accent: '#b8563a' },
  },
  {
    slug: 'sasirangan-banjar-gelombang',
    motif: 'sasirangan',
    palette: 'banjar-senja',
    colors: { base: '#3d1445', motif: '#c4247a', highlight: '#f2b3d4', accent: '#f0a020' },
  },
  {
    slug: 'batik-kawung-solo-sogan',
    motif: 'kawung',
    palette: 'sogan-klasik',
    colors: { base: '#d9c9a8', motif: '#5d3722', highlight: '#a8794a', accent: '#2c1f16' },
  },
  {
    slug: 'tapis-lampung-pucuk-rebung',
    motif: 'tapis',
    palette: 'tapis-malam',
    colors: { base: '#101b33', motif: '#1b2e52', highlight: '#f6e3a1', accent: '#c9a227' },
    foil: ['#6f5410', '#fbf0c8', '#d4ac30'],
  },
  {
    slug: 'lipa-sabbe-bugis-sengkang',
    motif: 'silkCheck',
    palette: 'sabbe-delima',
    colors: { base: '#8c1220', motif: '#e8b923', highlight: '#f7ecc9', accent: '#14524a' },
  },
  {
    slug: 'tenun-troso-jepara-ombak',
    motif: 'chevron',
    palette: 'troso-tembaga',
    colors: { base: '#0e3b3e', motif: '#b87333', highlight: '#e6c9a0', accent: '#7fb2a8' },
  },
]

export const BRAND = {
  ink: '#0e1729',
  inkDeep: '#080d18',
  gold: '#e8c766',
  goldDeep: '#c9a227',
  cream: '#f6f1e7',
}
