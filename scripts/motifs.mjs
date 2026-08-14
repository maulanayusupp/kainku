/**
 * Motif builders for the Kainku catalogue artwork.
 *
 * Every product gets its own generator so no two swatches look alike. Each
 * builder returns `{ defs, tile }` where `tile` is the id of an SVG <pattern>
 * that can be painted onto any rectangle. Patterns keep the output files tiny
 * (a few kB) while staying razor sharp at any size.
 *
 * The motifs are geometric interpretations of well-known Indonesian textile
 * traditions — they are original drawings, not reproductions of any particular
 * artisan's work.
 */

/** Deterministic PRNG so repeated runs produce byte-identical files. */
export function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const r2 = (n) => Math.round(n * 100) / 100

/* -------------------------------------------------------------------------- */
/* Shared texture                                                             */
/* -------------------------------------------------------------------------- */

/** Fine warp/weft threads laid over every motif so it reads as woven cloth. */
export function weaveOverlay(id, opacity = 0.16) {
  return `
  <pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse">
    <rect width="6" height="6" fill="none"/>
    <path d="M0 0.5H6M0 3.5H6" stroke="#ffffff" stroke-width="0.6" opacity="${opacity}"/>
    <path d="M0.5 0V6M3.5 0V6" stroke="#000000" stroke-width="0.6" opacity="${opacity * 0.75}"/>
  </pattern>`
}

/** Soft cloth folds — a few overlapping gradients give the swatch some body. */
export function drapeShading(id) {
  return `
  <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.20"/>
    <stop offset="22%" stop-color="#000000" stop-opacity="0.16"/>
    <stop offset="44%" stop-color="#ffffff" stop-opacity="0.14"/>
    <stop offset="63%" stop-color="#000000" stop-opacity="0.20"/>
    <stop offset="82%" stop-color="#ffffff" stop-opacity="0.10"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.26"/>
  </linearGradient>`
}

/** Metallic thread gradient used by songket / tapis. */
export function foilGradient(id, a = '#7d5f12', b = '#f6e3a1', c = '#c9a227') {
  return `
  <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0.4">
    <stop offset="0%" stop-color="${a}"/>
    <stop offset="30%" stop-color="${b}"/>
    <stop offset="55%" stop-color="${c}"/>
    <stop offset="78%" stop-color="${b}"/>
    <stop offset="100%" stop-color="${a}"/>
  </linearGradient>`
}

/* -------------------------------------------------------------------------- */
/* Motif builders — one per product                                           */
/* -------------------------------------------------------------------------- */

/** Parang: the diagonal "broken blade" rows of Central Javanese batik. */
export function parang(id, p) {
  const blade = (x) => `
      <path d="M${x} 0 C ${x + 26} 18, ${x + 26} 44, ${x} 62 C ${x - 26} 80, ${x - 26} 106, ${x} 124"
            fill="none" stroke="${p.motif}" stroke-width="15" stroke-linecap="round"/>
      <path d="M${x} 0 C ${x + 26} 18, ${x + 26} 44, ${x} 62 C ${x - 26} 80, ${x - 26} 106, ${x} 124"
            fill="none" stroke="${p.highlight}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>`
  return {
    defs: `
  <pattern id="${id}" width="124" height="124" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
    <rect width="124" height="124" fill="${p.base}"/>
    ${blade(20)}${blade(82)}
    <path d="M51 0V124M113 0V124" stroke="${p.accent}" stroke-width="3" stroke-dasharray="9 7" opacity="0.85"/>
  </pattern>`,
  }
}

/** Ikat: resist-dyed arrowheads with the feathered edges the technique creates. */
export function ikat(id, p) {
  const feather = (cx, cy, w, h, fill) => {
    let out = ''
    for (let i = -3; i <= 3; i++) {
      const o = 1 - Math.abs(i) / 4.5
      out += `<path d="M${r2(cx)} ${r2(cy - h / 2 + i * 3)} L${r2(cx + w / 2)} ${r2(cy + i * 3)} L${r2(cx)} ${r2(cy + h / 2 + i * 3)} L${r2(cx - w / 2)} ${r2(cy + i * 3)} Z" fill="${fill}" opacity="${r2(o * 0.5)}"/>`
    }
    return out
  }
  return {
    defs: `
  <pattern id="${id}" width="150" height="150" patternUnits="userSpaceOnUse">
    <rect width="150" height="150" fill="${p.base}"/>
    <rect y="0" width="150" height="8" fill="${p.accent}" opacity="0.55"/>
    <rect y="142" width="150" height="8" fill="${p.accent}" opacity="0.55"/>
    ${feather(75, 75, 96, 104, p.motif)}
    ${feather(0, 75, 60, 70, p.highlight)}
    ${feather(150, 75, 60, 70, p.highlight)}
    <path d="M0 36H150M0 114H150" stroke="${p.highlight}" stroke-width="2" opacity="0.35"/>
  </pattern>`,
  }
}

/** Songket: supplementary gold weft floating over a dense ground. */
export function songket(id, p, foil) {
  return {
    defs: `
  <pattern id="${id}" width="96" height="96" patternUnits="userSpaceOnUse">
    <rect width="96" height="96" fill="${p.base}"/>
    <path d="M48 8 L88 48 L48 88 L8 48 Z" fill="none" stroke="url(#${foil})" stroke-width="6"/>
    <path d="M48 26 L70 48 L48 70 L26 48 Z" fill="url(#${foil})" opacity="0.92"/>
    <circle cx="48" cy="48" r="7" fill="${p.base}"/>
    <path d="M0 0 L14 14 M96 0 L82 14 M0 96 L14 82 M96 96 L82 82" stroke="url(#${foil})" stroke-width="4" stroke-linecap="round"/>
    <path d="M0 48H10M86 48H96M48 0V10M48 86V96" stroke="url(#${foil})" stroke-width="3.5" stroke-linecap="round"/>
  </pattern>`,
  }
}

/** Mega mendung: the stacked storm-cloud scallops of Cirebon. */
export function megaMendung(id, p) {
  const scallop = (y, scale, fill, op) => `
      <path d="M-10 ${y} q 26 -${22 * scale} 52 0 q 26 -${22 * scale} 52 0 q 26 -${22 * scale} 52 0 L154 ${y + 60} L-10 ${y + 60} Z"
            fill="${fill}" opacity="${op}"/>`
  return {
    defs: `
  <pattern id="${id}" width="144" height="144" patternUnits="userSpaceOnUse">
    <rect width="144" height="144" fill="${p.base}"/>
    ${scallop(24, 1.0, p.motif, 0.95)}
    ${scallop(54, 0.85, p.accent, 0.9)}
    ${scallop(84, 0.7, p.highlight, 0.85)}
    ${scallop(114, 0.55, p.base, 0.75)}
    <path d="M-10 24 q 26 -22 52 0 q 26 -22 52 0 q 26 -22 52 0" fill="none" stroke="${p.highlight}" stroke-width="2.5" opacity="0.7"/>
  </pattern>`,
  }
}

/** Lurik: the counted warp stripes of Yogyakarta. */
export function lurik(id, p) {
  const widths = [14, 4, 3, 22, 6, 3, 3, 11, 5, 30, 4, 9]
  const fills = [p.base, p.motif, p.highlight, p.base, p.accent, p.motif, p.highlight, p.base, p.motif, p.base, p.accent, p.motif]
  let x = 0
  const bars = widths
    .map((w, i) => {
      const bar = `<rect x="${x}" y="0" width="${w}" height="120" fill="${fills[i]}"/>`
      x += w
      return bar
    })
    .join('')
  return {
    defs: `
  <pattern id="${id}" width="${x}" height="120" patternUnits="userSpaceOnUse">
    ${bars}
    <path d="M0 0H${x}" stroke="#ffffff" stroke-width="120" opacity="0"/>
  </pattern>`,
  }
}

/** Ulos: banded warp stripes closed by geometric end panels. */
export function ulos(id, p) {
  return {
    defs: `
  <pattern id="${id}" width="120" height="132" patternUnits="userSpaceOnUse">
    <rect width="120" height="132" fill="${p.base}"/>
    <rect y="0" width="120" height="26" fill="${p.motif}"/>
    <rect y="30" width="120" height="5" fill="${p.highlight}"/>
    <rect y="39" width="120" height="3" fill="${p.accent}"/>
    <rect y="60" width="120" height="34" fill="${p.motif}" opacity="0.55"/>
    <rect y="100" width="120" height="5" fill="${p.highlight}"/>
    <rect y="110" width="120" height="3" fill="${p.accent}"/>
    <g fill="${p.highlight}">
      <path d="M10 60 L22 77 L10 94 Z"/><path d="M40 60 L52 77 L40 94 Z"/>
      <path d="M70 60 L82 77 L70 94 Z"/><path d="M100 60 L112 77 L100 94 Z"/>
    </g>
    <path d="M0 13H120" stroke="${p.accent}" stroke-width="3" stroke-dasharray="6 6"/>
  </pattern>`,
  }
}

/** Endek: small ikat lozenges set in a tight grid. */
export function endek(id, p) {
  return {
    defs: `
  <pattern id="${id}" width="80" height="80" patternUnits="userSpaceOnUse">
    <rect width="80" height="80" fill="${p.base}"/>
    <path d="M40 6 L58 40 L40 74 L22 40 Z" fill="${p.motif}"/>
    <path d="M40 20 L50 40 L40 60 L30 40 Z" fill="${p.highlight}"/>
    <path d="M0 40 L14 26 L28 40 L14 54 Z" fill="${p.accent}" opacity="0.9"/>
    <path d="M80 40 L66 26 L52 40 L66 54 Z" fill="${p.accent}" opacity="0.9"/>
    <path d="M0 0H80M0 80H80" stroke="${p.highlight}" stroke-width="2" opacity="0.4"/>
  </pattern>`,
  }
}

/** Sasirangan: stitched-resist ripples that pool colour along each seam. */
export function sasirangan(id, p) {
  let waves = ''
  for (let i = 0; i < 7; i++) {
    const y = 12 + i * 22
    const sw = i % 2 === 0 ? 9 : 5
    const col = i % 3 === 0 ? p.motif : i % 3 === 1 ? p.accent : p.highlight
    waves += `<path d="M0 ${y} q 20 -14 40 0 q 20 14 40 0 q 20 -14 40 0 q 20 14 40 0" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" opacity="0.85"/>`
  }
  return {
    defs: `
  <pattern id="${id}" width="160" height="160" patternUnits="userSpaceOnUse">
    <rect width="160" height="160" fill="${p.base}"/>
    ${waves}
    <path d="M0 0V160M53 0V160M107 0V160" stroke="${p.highlight}" stroke-width="1.5" stroke-dasharray="4 8" opacity="0.5"/>
  </pattern>`,
  }
}

/** Kawung: four interlocking ellipses — one of Java's oldest motifs. */
export function kawung(id, p) {
  const petal = (cx, cy, rx, ry, fill) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/>`
  const cluster = (ox, oy) => `
      ${petal(ox - 17, oy, 16, 25, p.motif)}${petal(ox + 17, oy, 16, 25, p.motif)}
      ${petal(ox, oy - 17, 25, 16, p.motif)}${petal(ox, oy + 17, 25, 16, p.motif)}
      ${petal(ox - 17, oy, 8, 13, p.highlight)}${petal(ox + 17, oy, 8, 13, p.highlight)}
      ${petal(ox, oy - 17, 13, 8, p.highlight)}${petal(ox, oy + 17, 13, 8, p.highlight)}
      <circle cx="${ox}" cy="${oy}" r="4.5" fill="${p.accent}"/>`
  return {
    defs: `
  <pattern id="${id}" width="112" height="112" patternUnits="userSpaceOnUse">
    <rect width="112" height="112" fill="${p.base}"/>
    ${cluster(28, 28)}${cluster(84, 28)}${cluster(28, 84)}${cluster(84, 84)}
    ${cluster(56, 56)}
  </pattern>`,
  }
}

/** Tapis: horizontal couched-gold bands over a dark ground. */
export function tapis(id, p, foil) {
  return {
    defs: `
  <pattern id="${id}" width="128" height="104" patternUnits="userSpaceOnUse">
    <rect width="128" height="104" fill="${p.base}"/>
    <rect y="0" width="128" height="14" fill="${p.motif}"/>
    <g stroke="url(#${foil})" fill="none">
      <path d="M0 20H128" stroke-width="3"/>
      <path d="M0 26H128" stroke-width="1.5" opacity="0.7"/>
      <!-- pucuk rebung: the bamboo-shoot triangles that give the cloth its name -->
      <path d="M0 52 L16 30 L32 52 L48 30 L64 52 L80 30 L96 52 L112 30 L128 52" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M8 52 L16 41 L24 52 M40 52 L48 41 L56 52 M72 52 L80 41 L88 52 M104 52 L112 41 L120 52" stroke-width="2"/>
      <path d="M0 58H128" stroke-width="3"/>
      <path d="M0 64H128" stroke-width="1.5" opacity="0.7"/>
      <path d="M2 84 q 14 -16 28 0 q 14 16 28 0 q 14 -16 28 0 q 14 16 28 0" stroke-width="3.5"/>
      <path d="M0 96H128" stroke-width="2.5"/>
    </g>
    <g fill="url(#${foil})">
      <circle cx="16" cy="76" r="2.6"/><circle cx="44" cy="76" r="2.6"/>
      <circle cx="72" cy="76" r="2.6"/><circle cx="100" cy="76" r="2.6"/>
    </g>
    <rect y="14" width="128" height="3" fill="${p.accent}" opacity="0.85"/>
    <rect y="100" width="128" height="4" fill="${p.motif}"/>
  </pattern>`,
  }
}

/** Lipa' sabbe: the bold silk check of Sengkang, South Sulawesi. */
export function silkCheck(id, p) {
  return {
    defs: `
  <pattern id="${id}" width="110" height="110" patternUnits="userSpaceOnUse">
    <rect width="110" height="110" fill="${p.base}"/>
    <rect x="0" y="0" width="110" height="34" fill="${p.motif}" opacity="0.85"/>
    <rect x="0" y="0" width="34" height="110" fill="${p.motif}" opacity="0.85"/>
    <rect x="0" y="0" width="34" height="34" fill="${p.accent}"/>
    <rect x="52" y="0" width="6" height="110" fill="${p.highlight}" opacity="0.9"/>
    <rect x="0" y="52" width="110" height="6" fill="${p.highlight}" opacity="0.9"/>
    <rect x="84" y="0" width="2.5" height="110" fill="${p.highlight}" opacity="0.6"/>
    <rect x="0" y="84" width="110" height="2.5" fill="${p.highlight}" opacity="0.6"/>
  </pattern>`,
  }
}

/** Troso: chevron weft picked out with a contrasting metallic thread. */
export function chevron(id, p) {
  return {
    defs: `
  <pattern id="${id}" width="96" height="72" patternUnits="userSpaceOnUse">
    <rect width="96" height="72" fill="${p.base}"/>
    <path d="M0 24 L24 0 L48 24 L72 0 L96 24 L96 34 L72 10 L48 34 L24 10 L0 34 Z" fill="${p.motif}"/>
    <path d="M0 60 L24 36 L48 60 L72 36 L96 60 L96 68 L72 44 L48 68 L24 44 L0 68 Z" fill="${p.accent}" opacity="0.9"/>
    <path d="M0 24 L24 0 L48 24 L72 0 L96 24" fill="none" stroke="${p.highlight}" stroke-width="2.5"/>
    <path d="M0 60 L24 36 L48 60 L72 36 L96 60" fill="none" stroke="${p.highlight}" stroke-width="2" opacity="0.7"/>
  </pattern>`,
  }
}

export const MOTIF_BUILDERS = {
  parang,
  ikat,
  songket,
  megaMendung,
  lurik,
  ulos,
  endek,
  sasirangan,
  kawung,
  tapis,
  silkCheck,
  chevron,
}
