#!/usr/bin/env node
/**
 * Generates every image the site ships with:
 *
 *   public/images/products/<slug>-{drape,macro,fold}.svg   — 3 views per item
 *   public/images/brand/{logo,logo-mark}.svg
 *   public/{favicon.svg,favicon.ico,apple-touch-icon.png,icon-*.png}
 *   public/images/brand/og-default.png                     — 1200x630 social card
 *   public/site.webmanifest
 *
 * Everything is drawn from code, so the artwork is original to this project and
 * there are no third-party image licences to track. Output is deterministic:
 * re-running produces byte-identical files.
 *
 * Usage: npm run assets:generate
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { BRAND, CATALOG } from './catalog.mjs'
import { MOTIF_BUILDERS, drapeShading, foilGradient, weaveOverlay } from './motifs.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'public')

/* -------------------------------------------------------------------------- */
/* Frame builders                                                             */
/* -------------------------------------------------------------------------- */

function buildPattern(item, patternId, foilId) {
  const builder = MOTIF_BUILDERS[item.motif]
  if (!builder) throw new Error(`Unknown motif "${item.motif}" for ${item.slug}`)
  const needsFoil = builder.length >= 3
  return builder(patternId, item.colors, needsFoil ? foilId : undefined)
}

/** Shared <defs> for a product image. */
function commonDefs(item, ids) {
  const foil = item.foil ?? ['#7d5f12', '#f6e3a1', '#c9a227']
  return `
  ${foilGradient(ids.foil, ...foil)}
  ${buildPattern(item, ids.pattern, ids.foil).defs}
  ${weaveOverlay(ids.weave)}
  ${drapeShading(ids.drape)}
  <radialGradient id="${ids.vignette}" cx="50%" cy="42%" r="78%">
    <stop offset="55%" stop-color="#000000" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.42"/>
  </radialGradient>
  <linearGradient id="${ids.sheen}" x1="0" y1="0" x2="0.7" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
    <stop offset="40%" stop-color="#ffffff" stop-opacity="0"/>
  </linearGradient>`
}

const idsFor = (slug, view) => ({
  pattern: `p-${slug}-${view}`,
  weave: `w-${slug}-${view}`,
  drape: `d-${slug}-${view}`,
  foil: `f-${slug}-${view}`,
  vignette: `v-${slug}-${view}`,
  sheen: `s-${slug}-${view}`,
  clip: `c-${slug}-${view}`,
})

/** View 1 — a hanging length of cloth with soft folds. */
function drapeView(item) {
  const W = 900
  const H = 1200
  const ids = idsFor(item.slug, 'drape')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>${commonDefs(item, ids)}</defs>
  <rect width="${W}" height="${H}" fill="${item.colors.base}"/>
  <g transform="scale(1.6)">
    <rect width="${W / 1.6}" height="${H / 1.6}" fill="url(#${ids.pattern})"/>
  </g>
  <rect width="${W}" height="${H}" fill="url(#${ids.weave})"/>
  <rect width="${W}" height="${H}" fill="url(#${ids.drape})"/>
  <rect width="${W}" height="${H}" fill="url(#${ids.sheen})"/>
  <rect width="${W}" height="${H}" fill="url(#${ids.vignette})"/>
  <g opacity="0.5">
    <path d="M0 0 V${H}" stroke="#000" stroke-width="26" opacity="0.18"/>
    <path d="M${W} 0 V${H}" stroke="#000" stroke-width="26" opacity="0.18"/>
  </g>
</svg>`
}

/** View 2 — macro crop so the weave structure is legible. */
function macroView(item) {
  const S = 1000
  const ids = idsFor(item.slug, 'macro')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" role="img">
  <defs>
    ${commonDefs(item, ids)}
    ${weaveOverlay(ids.weave + '-hi', 0.3)}
  </defs>
  <rect width="${S}" height="${S}" fill="${item.colors.base}"/>
  <g transform="rotate(8 500 500) scale(3.4)">
    <rect x="-60" y="-60" width="${S / 3.4 + 120}" height="${S / 3.4 + 120}" fill="url(#${ids.pattern})"/>
  </g>
  <rect width="${S}" height="${S}" fill="url(#${ids.weave}-hi)"/>
  <rect width="${S}" height="${S}" fill="url(#${ids.vignette})"/>
  <rect width="${S}" height="${S}" fill="url(#${ids.sheen})" opacity="0.6"/>
</svg>`
}

/** View 3 — folded bolts stacked on a neutral studio ground. */
function foldView(item) {
  const W = 1000
  const H = 1250
  const ids = idsFor(item.slug, 'fold')
  const band = (y, h, rot, op) => `
    <g transform="rotate(${rot} 500 ${y + h / 2})">
      <rect x="-40" y="${y}" width="${W + 80}" height="${h}" fill="url(#${ids.pattern})"/>
      <rect x="-40" y="${y}" width="${W + 80}" height="${h}" fill="url(#${ids.weave})"/>
      <rect x="-40" y="${y}" width="${W + 80}" height="12" fill="#ffffff" opacity="0.16"/>
      <rect x="-40" y="${y + h - 14}" width="${W + 80}" height="14" fill="#000000" opacity="${op}"/>
    </g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>
    ${commonDefs(item, ids)}
    <linearGradient id="${ids.clip}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BRAND.cream}"/>
      <stop offset="100%" stop-color="#ddd2bd"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${ids.clip})"/>
  ${band(150, 260, -6, 0.3)}
  ${band(470, 260, 3, 0.34)}
  ${band(790, 260, -2, 0.38)}
  <rect width="${W}" height="${H}" fill="url(#${ids.vignette})" opacity="0.7"/>
</svg>`
}

/* -------------------------------------------------------------------------- */
/* Brand marks                                                                */
/* -------------------------------------------------------------------------- */

/**
 * The mark is a "K" whose stem is drawn as three warp threads crossed by a
 * weft bar — a loom reference that still resolves cleanly at 16px.
 */
function logoMark({ bg = BRAND.ink, fg = BRAND.gold, rounded = true } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img">
  <rect width="64" height="64" rx="${rounded ? 14 : 0}" fill="${bg}"/>
  <g fill="${fg}">
    <rect x="15" y="14" width="7" height="36" rx="2"/>
    <path d="M28 31.5 L41.5 14 H50 L35.5 32.5 L50 50 H41.3 L28 33 Z"/>
  </g>
  <g stroke="${fg}" stroke-width="2" opacity="0.5" stroke-linecap="round">
    <path d="M11 24 H26"/>
    <path d="M11 32 H26"/>
    <path d="M11 40 H26"/>
  </g>
</svg>`
}

function logoLockup(fg = BRAND.cream, accent = BRAND.gold) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 64" width="280" height="64" role="img">
  <g>
    <rect width="64" height="64" rx="14" fill="${BRAND.ink}"/>
    <g fill="${accent}">
      <rect x="15" y="14" width="7" height="36" rx="2"/>
      <path d="M28 31.5 L41.5 14 H50 L35.5 32.5 L50 50 H41.3 L28 33 Z"/>
    </g>
    <g stroke="${accent}" stroke-width="1.6" opacity="0.55" stroke-linecap="round">
      <path d="M11 24 H26"/><path d="M11 32 H26"/><path d="M11 40 H26"/>
    </g>
  </g>
  <text x="82" y="40" font-family="Georgia, 'Times New Roman', serif" font-size="30" font-weight="600" fill="${fg}" letter-spacing="0.5">Kainku</text>
  <text x="83" y="54" font-family="Helvetica, Arial, sans-serif" font-size="8.5" fill="${accent}" letter-spacing="3.2">KAIN NUSANTARA</text>
</svg>`
}

/** Social card. Kept filter-free so sharp can rasterise it reliably. */
function ogImage() {
  const W = 1200
  const H = 630
  const strip = CATALOG.slice(0, 6)
    .map((item, i) => {
      const ids = idsFor(item.slug, `og${i}`)
      return {
        defs: `${foilGradient(ids.foil, ...(item.foil ?? ['#7d5f12', '#f6e3a1', '#c9a227']))}
               ${buildPattern(item, ids.pattern, ids.foil).defs}`,
        rect: `<rect x="${640 + (i % 3) * 190}" y="${i < 3 ? 96 : 340}" width="170" height="194" rx="10" fill="url(#${ids.pattern})"/>`,
      }
    })
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    ${strip.map((s) => s.defs).join('\n')}
    <linearGradient id="og-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BRAND.ink}"/>
      <stop offset="100%" stop-color="${BRAND.inkDeep}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#og-bg)"/>
  ${strip.map((s) => s.rect).join('\n')}
  <g transform="translate(72 96) scale(0.9)">
    <rect width="64" height="64" rx="14" fill="${BRAND.gold}"/>
    <g fill="${BRAND.ink}">
      <rect x="15" y="14" width="7" height="36" rx="2"/>
      <path d="M28 31.5 L41.5 14 H50 L35.5 32.5 L50 50 H41.3 L28 33 Z"/>
    </g>
  </g>
  <text x="72" y="268" font-family="Georgia, serif" font-size="76" font-weight="700" fill="${BRAND.cream}">Kainku</text>
  <text x="72" y="330" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="${BRAND.gold}" letter-spacing="4">KAIN NUSANTARA</text>
  <text x="72" y="404" font-family="Helvetica, Arial, sans-serif" font-size="27" fill="#c8d0dd">Batik, tenun, dan songket —</text>
  <text x="72" y="444" font-family="Helvetica, Arial, sans-serif" font-size="27" fill="#c8d0dd">dipilih per meter untuk proyek Anda.</text>
  <rect x="72" y="496" width="176" height="4" fill="${BRAND.goldDeep}"/>
</svg>`
}

/* -------------------------------------------------------------------------- */
/* ICO container                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Minimal ICO writer. Each entry embeds a PNG payload, which every browser in
 * current use supports and keeps the file far smaller than raw BMP data.
 */
function buildIco(pngs) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(pngs.length, 4)

  let offset = 6 + pngs.length * 16
  const dir = []
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0) // width  (0 means 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1) // height
    e.writeUInt8(0, 2) // palette count
    e.writeUInt8(0, 3) // reserved
    e.writeUInt16LE(1, 4) // colour planes
    e.writeUInt16LE(32, 6) // bits per pixel
    e.writeUInt32LE(data.length, 8)
    e.writeUInt32LE(offset, 12)
    dir.push(e)
    offset += data.length
  }
  return Buffer.concat([header, ...dir, ...pngs.map((p) => p.data)])
}

/* -------------------------------------------------------------------------- */
/* Runner                                                                     */
/* -------------------------------------------------------------------------- */

async function write(relPath, contents) {
  const full = join(PUBLIC, relPath)
  await mkdir(dirname(full), { recursive: true })
  await writeFile(full, contents)
  return relPath
}

async function main() {
  const written = []

  // -- Product artwork ---------------------------------------------------------
  for (const item of CATALOG) {
    written.push(await write(`images/products/${item.slug}-drape.svg`, drapeView(item)))
    written.push(await write(`images/products/${item.slug}-macro.svg`, macroView(item)))
    written.push(await write(`images/products/${item.slug}-fold.svg`, foldView(item)))
  }

  // -- Brand marks -------------------------------------------------------------
  written.push(await write('images/brand/logo-mark.svg', logoMark()))
  written.push(await write('images/brand/logo.svg', logoLockup()))
  written.push(await write('favicon.svg', logoMark()))

  // -- Raster icons ------------------------------------------------------------
  const markSvg = Buffer.from(logoMark())
  const png = (size) => sharp(markSvg, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer()

  const [i48, i32, i16, i180, i192, i512] = await Promise.all(
    [48, 32, 16, 180, 192, 512].map(png),
  )
  written.push(await write('apple-touch-icon.png', i180))
  written.push(await write('icon-192.png', i192))
  written.push(await write('icon-512.png', i512))
  written.push(
    await write(
      'favicon.ico',
      buildIco([
        { size: 16, data: i16 },
        { size: 32, data: i32 },
        { size: 48, data: i48 },
      ]),
    ),
  )

  // -- Social card -------------------------------------------------------------
  const og = await sharp(Buffer.from(ogImage()), { density: 144 })
    .resize(1200, 630)
    .png({ compressionLevel: 9 })
    .toBuffer()
  written.push(await write('images/brand/og-default.png', og))

  // -- Web app manifest --------------------------------------------------------
  written.push(
    await write(
      'site.webmanifest',
      `${JSON.stringify(
        {
          name: 'Kainku — Kain Nusantara',
          short_name: 'Kainku',
          description: 'Katalog kain Nusantara: batik, tenun, dan songket, dijual per meter.',
          start_url: '/',
          display: 'standalone',
          background_color: BRAND.ink,
          theme_color: BRAND.ink,
          lang: 'id',
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
          ],
        },
        null,
        2,
      )}\n`,
    ),
  )

  console.log(`Generated ${written.length} asset(s) into public/`)
  console.log(`  ${CATALOG.length} products x 3 views = ${CATALOG.length * 3} SVG swatches`)
}

main().catch((error) => {
  console.error('[generate-assets] failed:', error)
  process.exitCode = 1
})
