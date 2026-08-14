#!/usr/bin/env node
/**
 * Project consistency checks. Run with `npm run check`.
 *
 *   1. ID and EN expose exactly the same translation keys.
 *   2. Every product slug in app/data/products.ts has copy in BOTH locales.
 *   3. Every product slug has its three generated SVG views in public/.
 *   4. Every `palette` token exists in _swatch.scss and in scripts/catalog.mjs.
 *   5. Every og:image in the BUILT output is a raster, absolute, present, and
 *      inside WhatsApp's preview size budget.
 *
 * These are the ways this codebase can silently drift, because the data, the
 * copy, the artwork, and the styling each live in a different file by design.
 * Check 5 needs `.output/` and is skipped (with a note) when absent.
 * Exits non-zero on failure so CI can gate on it.
 */
import { readFile, access, readdir, stat } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CATALOG } from './catalog.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const LOCALES = ['id', 'en']
const FILES = ['common.json', 'shop.json', 'products.json', 'legal.json']
const VIEWS = ['drape', 'macro', 'fold']
/** WhatsApp silently drops preview images above roughly this size. */
const OG_MAX_BYTES = 300 * 1024

let ogSummary = ''
const problems = []
const note = (message) => problems.push(message)

/** Flattens a nested object into dotted paths. Arrays are compared by length. */
function flatten(value, prefix = '', out = new Set()) {
  if (Array.isArray(value)) {
    out.add(`${prefix}[]:${value.length}`)
    value.forEach((entry, index) => flatten(entry, `${prefix}[${index}]`, out))
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, out)
    }
  } else {
    out.add(prefix)
  }
  return out
}

async function loadLocale(locale) {
  const merged = {}
  for (const file of FILES) {
    const path = join(ROOT, 'i18n/locales', locale, file)
    try {
      Object.assign(merged, JSON.parse(await readFile(path, 'utf8')))
    } catch (error) {
      note(`Cannot read i18n/locales/${locale}/${file}: ${error.message}`)
    }
  }
  return merged
}

/** File size in bytes, or `null` when the file is absent. */
async function fileSize(relPath) {
  try {
    return (await stat(join(ROOT, relPath))).size
  } catch {
    return null
  }
}

async function exists(relPath) {
  try {
    await access(join(ROOT, relPath))
    return true
  } catch {
    return false
  }
}

/* -- 1. Locale parity -------------------------------------------------------- */

const [idMessages, enMessages] = await Promise.all(LOCALES.map(loadLocale))
const idKeys = flatten(idMessages)
const enKeys = flatten(enMessages)

const missingInEn = [...idKeys].filter((key) => !enKeys.has(key))
const missingInId = [...enKeys].filter((key) => !idKeys.has(key))

for (const key of missingInEn) note(`Key present in ID but missing/different in EN: ${key}`)
for (const key of missingInId) note(`Key present in EN but missing/different in ID: ${key}`)

/* -- 2 & 3. Product copy and artwork ---------------------------------------- */

const productsSource = await readFile(join(ROOT, 'app/data/products.ts'), 'utf8')
const slugs = [...productsSource.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1])

if (slugs.length === 0) note('No product slugs found in app/data/products.ts')

for (const slug of slugs) {
  for (const [locale, messages] of [
    ['id', idMessages],
    ['en', enMessages],
  ]) {
    const entry = messages.products?.[slug]
    if (!entry) {
      note(`Missing ${locale} copy for product "${slug}"`)
      continue
    }
    for (const field of ['name', 'tagline', 'description', 'story']) {
      if (!entry[field]) note(`Product "${slug}" is missing ${locale}.${field}`)
    }
    for (const field of ['care', 'bestFor']) {
      if (!Array.isArray(entry[field]) || entry[field].length === 0) {
        note(`Product "${slug}" is missing ${locale}.${field}`)
      }
    }
  }

  for (const view of VIEWS) {
    const path = `public/images/products/${slug}-${view}.svg`
    if (!(await exists(path))) {
      note(`Missing artwork ${path} — run \`npm run assets:generate\``)
    }
  }

  // Social cards must exist per locale AND stay inside WhatsApp's preview
  // budget, otherwise a shared product link renders with no image.
  for (const suffix of ['og', 'og-en']) {
    const path = `public/images/products/${slug}-${suffix}.png`
    const size = await fileSize(path)
    if (size === null) {
      note(`Missing social card ${path} — run \`npm run assets:generate\``)
    } else if (size > OG_MAX_BYTES) {
      note(`Social card ${path} is ${Math.round(size / 1024)} KB, over the 300 KB WhatsApp budget`)
    }
  }
}

/* -- 4. Palette tokens ------------------------------------------------------- */

const swatchScss = await readFile(join(ROOT, 'app/assets/scss/components/_swatch.scss'), 'utf8')
const palettes = [...productsSource.matchAll(/palette:\s*'([^']+)'/g)].map((match) => match[1])
const artPalettes = new Set(CATALOG.map((item) => item.palette))
const artSlugs = new Set(CATALOG.map((item) => item.slug))

for (const palette of new Set(palettes)) {
  if (!swatchScss.includes(`'${palette}'`)) {
    note(`Palette "${palette}" has no entry in _swatch.scss $palettes map`)
  }
  if (!artPalettes.has(palette)) {
    note(`Palette "${palette}" has no entry in scripts/catalog.mjs`)
  }
}

for (const slug of slugs) {
  if (!artSlugs.has(slug)) note(`Product "${slug}" has no artwork spec in scripts/catalog.mjs`)
}
for (const slug of artSlugs) {
  if (!slugs.includes(slug)) note(`scripts/catalog.mjs defines "${slug}" but no product uses it`)
}

/* -- 5. Every advertised og:image must actually work ------------------------- */

// Checked against the BUILT output rather than the page source, because the
// image path is assembled in app/data/products.ts — a source-level grep for
// ".svg" would never match and would give false confidence.
//
// Three things break a WhatsApp/Instagram preview, none of which any other
// check would catch:
//   • an SVG (no scraper renders it)
//   • a relative URL (scrapers do not resolve against the page)
//   • a file that is not actually deployed
if (await exists('.output/public')) {
  const htmlFiles = (await readdir(join(ROOT, '.output/public'), { recursive: true }))
    .map(String)
    .filter((file) => file.endsWith('.html'))
    // `sitemap.xml/index.html` is a redirect stub emitted by @nuxtjs/sitemap,
    // and 200/404 are SPA fallbacks — none of them are shareable pages.
    .filter((file) => !/^(__sitemap__|sitemap)|\/(200|404)\.html$|^(200|404)\.html$/.test(file))

  const seen = new Map()
  for (const file of htmlFiles) {
    const html = await readFile(join(ROOT, '.output/public', file), 'utf8')
    const match = html.match(/<meta property="og:image" content="([^"]+)"/)
    if (!match) {
      note(`${file} renders no og:image — links to it will preview without an image`)
      continue
    }
    seen.set(match[1], (seen.get(match[1]) ?? 0) + 1)
  }

  for (const url of seen.keys()) {
    if (/\.svgz?($|\?)/i.test(url)) {
      note(`og:image "${url}" is an SVG — WhatsApp, Instagram and Facebook show no preview`)
    }
    if (!/^https?:\/\//i.test(url)) {
      note(`og:image "${url}" is not absolute — social scrapers cannot resolve it`)
    }

    const path = url.replace(/^https?:\/\/[^/]+/i, '')
    const size = await fileSize(join('.output/public', path))
    if (size === null) {
      note(`og:image "${url}" does not exist in the build output`)
    } else if (size > OG_MAX_BYTES) {
      note(`og:image "${url}" is ${Math.round(size / 1024)} KB, over the 300 KB WhatsApp budget`)
    }
  }

  ogSummary = `${seen.size} distinct og:image(s) across ${htmlFiles.length} pages`
} else {
  ogSummary = 'og:image not verified (no build output — run `npm run build` first)'
}

/* -- Report ------------------------------------------------------------------ */

if (problems.length) {
  console.error(`\n✗ ${problems.length} consistency problem(s):\n`)
  for (const problem of problems) console.error(`  • ${problem}`)
  console.error('')
  process.exit(1)
}

console.log(
  `✓ ${slugs.length} products · ${idKeys.size} translation keys · ` +
    `${slugs.length * VIEWS.length} artwork files · ${slugs.length * 2} social cards — all consistent`,
)
console.log(`  ${ogSummary}`)
