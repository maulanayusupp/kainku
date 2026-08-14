<div align="center">
  <img src="public/images/brand/logo.svg" alt="Kainku" width="240">

  **Kain Nusantara, dijual per meter.**

  A bilingual Nuxt 4 storefront for Indonesian textiles — batik, tenun,
  songket, and jumputan — sold by the metre.
</div>

---

## What this is

A complete storefront: a 12-piece catalogue with faceted filtering, product
pages with three views of each cloth, a metre-based cart, and a full checkout
flow. Indonesian is the default language and is served on unprefixed URLs;
English lives under `/en`.

> **This is a demonstration build.** Prices, stock levels, and lead times are
> illustrative. No payment is processed and no order is dispatched. The site
> states this to visitors on every relevant page and at `/legal/disclaimer`.
> See [`TODO.md`](TODO.md) for what would make it real.

## Highlights

- **Artwork generated from code.** All 36 product images (12 fabrics × 3 views)
  and the whole favicon set are produced by `scripts/generate-assets.mjs` as
  SVG — original geometric interpretations of traditional motifs. 200 KB for the
  entire catalogue, sharp at any size, with no third-party image licences.
- **Zero inline CSS.** No `<style>` blocks in components, no `style=` attributes
  anywhere. Per-product colour is driven by CSS custom properties set from
  generated classes. Verified clean in both source and rendered output.
- **Everything translated.** 781 keys across ID and EN, kept in lockstep by a
  consistency check that fails the build on drift.
- **SEO throughout.** Per-page titles and descriptions, Open Graph, hreflang
  alternates, JSON-LD (Organization, WebSite, Product, BreadcrumbList, FAQPage),
  and per-locale sitemaps.
- **Seven compliance pages** — privacy, terms, shipping, returns, cookies,
  accessibility, and disclaimer — all bilingual, and honest about what is not
  live yet.

## Requirements

| | |
|---|---|
| Node | **20.20.1** (see `.nvmrc`) |
| Nuxt | 4.3.1, pinned |

⚠️ Nuxt 4.4+ requires Node ≥ 22.19. Do not upgrade Nuxt without upgrading Node
first — see [`CLAUDE.md`](CLAUDE.md) §2.

## Getting started

```bash
npm install
cp .env.example .env      # optional; sensible defaults are built in
npm run dev               # http://localhost:3000
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (prerenders 142 routes) |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | `vue-tsc` — currently 0 errors |
| `npm run check` | Consistency gate: locale parity, product copy, artwork, palettes |
| `npm run test` | Headless tests (happy-dom) |
| `npm run verify` | typecheck + check + test |
| `npm run assets:generate` | Regenerate all product artwork and favicons |

## Project layout

```
app/
  assets/scss/   ITCSS stylesheet — the only place CSS lives
  components/    base · common · layout · home · product · commerce
  composables/   useCatalogue · useSeo · useProductContent · useCart…
  data/          the catalogue (data only — no copy, no formatting)
  pages/         Indonesian routes: /katalog /koleksi /produk/[slug] /legal/*
  services/      data access and cart arithmetic — pure, framework-free
  stores/        Pinia: cart, ui
  utils/         format · validate · storage · collection
server/api/      contact endpoint, sitemap source
i18n/locales/    id/ and en/ × common · shop · products · legal
scripts/         artwork generator, consistency checker
```

The dependency direction is `pages → composables → services → data/utils`.
Services hold no framework imports, so swapping the static catalogue for a real
API is a single-file change.

## Adding a product

Four files, then two commands:

1. `app/data/products.ts` — the record (price, width, weight, stock, palette)
2. `scripts/catalog.mjs` — motif type and colours for the artwork
3. `app/assets/scss/components/_swatch.scss` — the palette token
4. `i18n/locales/{id,en}/products.json` — the copy, in both languages

```bash
npm run assets:generate && npm run check
```

`npm run check` will name anything you missed.

## Tech

Nuxt 4 · Vue 3 · TypeScript (strict) · Pinia · `@nuxtjs/i18n` ·
`@nuxtjs/sitemap` · `@nuxtjs/robots` · `@nuxt/fonts` · Sass · sharp

Fonts are Fraunces (display) and Plus Jakarta Sans (body, drawn by the
Jakarta foundry Tokotype). Both are downloaded at build time and self-hosted, so
no request leaves the origin at runtime.

## Contributing

Read [`CLAUDE.md`](CLAUDE.md) first — it documents the styling rule, the i18n
rule, the content-honesty rule, and the layering rule, all of which are enforced
either by `npm run check` or by review.

Before committing:

```bash
npm run verify && npm run build
```

## Contact

**Maulana Yusup Abdullah** — <maulanayusupp@gmail.com>
