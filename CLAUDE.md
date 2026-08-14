# CLAUDE.md

Working notes for anyone — human or agent — changing this repository.
**Read this before editing. Update it in the same commit as any change it describes.**

---

## 1. What this is

Kainku is a Nuxt 4 storefront for Indonesian textiles sold **by the metre**
(batik, tenun, songket, jumputan). It is bilingual (ID default, EN secondary)
and ships a working catalogue → cart → checkout flow.

**It is a demonstration build.** No payment gateway, no inventory system, no
courier integration. See §9 before writing any user-facing copy.

---

## 2. Runtime constraint — read first

| | |
|---|---|
| Node | **20.20.1** (see `.nvmrc`) |
| Nuxt | **4.3.1, pinned exactly** |

Nuxt **4.4+ requires Node ≥ 22.19**. This machine runs Node 20, so 4.3.1 is the
newest release that can be used. **Do not run `npm update nuxt`** — it will
install a version that cannot start. To move to a newer Nuxt, upgrade Node first
(`nvm install 24`), then bump both together and update this table.

Transitive `EBADENGINE` warnings from `@babel/*` during install are expected and
harmless — those packages are not executed at runtime on this path.

---

## 3. Commands

```bash
npm run dev              # dev server
npm run build            # production build (prerenders 142 routes)
npm run preview          # serve the build
npm run typecheck        # vue-tsc — MUST be 0 errors before committing
npm run check            # project consistency gate (see §8)
npm run assets:generate  # regenerate all product artwork + favicons
```

`npm run build` does **not** typecheck (`typescript.typeCheck: false`, for build
speed). Run `npm run typecheck` yourself.

---

## 4. Directory map

```
app/
  assets/scss/     ITCSS stylesheet — the ONLY place CSS lives (§5)
  components/      flat-named (§6): base/ common/ layout/ home/ product/ commerce/
  composables/     Vue-aware logic (useCatalogue, useSeo, useProductContent, …)
  constants/site.ts  brand constants, imported by nuxt.config AND app code
  data/            the catalogue — plain data, no copy, no formatting
  pages/           file routes, Indonesian paths (/katalog, /produk/[slug], …)
  services/        data access + business arithmetic; pure, framework-free
  stores/          Pinia (cart, ui)
  types/           domain types
  utils/           pure helpers (format, validate, storage, collection)
server/
  api/             Nitro routes (contact, sitemap source)
  utils/           server-side validation — independent of the client copy
i18n/locales/{id,en}/   common | shop | products | legal
scripts/           artwork generator + consistency checker
```

**Layering rule:** `pages → composables → services → data/utils`.
Services must never import from `components/`, `stores/`, or Nuxt composables —
that is what keeps them testable and swappable for a real API later.

---

## 5. Styling — no inline CSS, ever

This is a hard project rule and it is currently **100% clean** (verified: zero
`style=` attributes in source and in rendered output, zero `<style>` blocks in
`.vue` files).

- Components carry **no `<style>` block**. Templates carry **no `style=`**.
- Every rule lives in a partial under `app/assets/scss/`, wired into
  `main.scss` in ITCSS order: `abstracts → base → layout → components → pages →
  utilities`.
- Partials start with `@use '../abstracts' as *;` (tokens only, emits no CSS).
- Class naming is BEM-ish: `.block__element--modifier`, utilities prefixed `u-`.

**Dynamic values without inline styles.** When something must vary per item, set
CSS custom properties from a *class*, never from a bound style attribute:

- Product colour → `:class="\`swatch--${product.palette}\`"`, and
  `components/_swatch.scss` maps each palette token to `--swatch-a/--swatch-b`.
- Progress bars → `:data-progress="step"` with generated width classes
  (`_cart.scss`, 0–100 in steps of 5).
- Reveal stagger → `:data-reveal-step="n"` with generated delay classes
  (`base/_animations.scss`, 1–12).

If you need a new dynamic value, add a generated class — do not reach for `:style`.

**Theming.** `base/_root.scss` defines one set of semantic variables
(`--c-bg`, `--c-text`, `--c-accent`, …). The default is cream; adding
`.theme-ink` to any section flips the same variable names to the dark palette.
Components are written once and inherit whichever theme they sit inside.

---

## 6. Components

`nuxt.config.ts` sets `components: [{ path: '~/components', pathPrefix: false }]`,
so the tag name is the **filename only** — `base/BaseIcon.vue` is `<BaseIcon>`,
not `<BaseBaseIcon>`. Consequence: **filenames must be unique across the whole
tree.** The sub-folders organise source, they do not namespace tags.

Conventions:
- `BaseButton` renders `<NuxtLink>` with `to`, `<a>` with `href`, `<button>`
  otherwise — never fake a link with a click handler.
- `BaseField` owns id/`aria-describedby`/`aria-invalid` wiring. Use it for every
  form control so labelling and error announcement stay correct.
- Icons are inline SVG in `BaseIcon` (`currentColor`, 24×24, 1.6 stroke).

---

## 7. i18n — every string, both languages

**ID is the default and is served unprefixed** (`/katalog`); EN is prefixed
(`/en/katalog`). Strategy: `prefix_except_default`.

- **No literal user-facing text in templates.** Everything goes through `t()`.
- Files are split per concern: `common | shop | products | legal`. Add a key to
  **both** `id/` and `en/` — `npm run check` fails the build otherwise.
- Product copy lives at `products.<slug>.{name,tagline,description,story,care[],bestFor[]}`,
  which is why `app/data/products.ts` holds no prose.
- Validation rules and service errors return **i18n keys, not sentences**, so the
  component resolves them in the active locale.
- `<i18n-t>` needs `scope="global"` here (messages are global, not per-component).
- Routes are Indonesian words in both locales by design (`/produk/…` also under
  `/en/`). If you localise route paths later, update `useNavigation()` and every
  `localePath()` call together.

**Adding a page:** create the route, add its label key to `useNavigation()`, add
the key to both locales, and add its SEO strings under `seo.*`.

---

## 8. The consistency gate — `npm run check`

Four things live in four different files by design, so a script enforces they
stay aligned. It exits non-zero and is safe to use in CI.

1. ID and EN expose an identical key set (including array lengths).
2. Every product slug has complete copy in **both** locales.
3. Every product slug has its three generated SVG views in `public/`.
4. Every `palette` token exists in `_swatch.scss` **and** `scripts/catalog.mjs`.

**Adding a product** therefore means touching four places:
`app/data/products.ts` → `scripts/catalog.mjs` (motif + colours) →
`_swatch.scss` (`$palettes`) → both locale `products.json`. Then
`npm run assets:generate && npm run check`.

---

## 9. Content honesty — non-negotiable

The site must not overclaim. Concretely:

- **Say what is not live.** Payment, stock, and dispatch are not connected.
  `<SampleDataNotice>` appears on the homepage, catalogue, PDP, cart, collection,
  FAQ, about, and every legal page. Do not remove it while
  `app/data/products.ts` still holds illustrative figures.
- **No invented credibility.** No fake reviews, ratings, customer counts, awards,
  certifications, or years-in-business. There are deliberately no star ratings.
- **Product artwork is generated vector art**, not photographs of real cloth.
  This is stated on `/legal/disclaimer`. Never describe it as photography.
- **Cultural claims stay modest.** Describe motif, technique, and material.
  Do not claim endorsement by, or affiliation with, any craft centre or
  community. Where origin is unknown, say nothing rather than guess.
- **Estimates are labelled as estimates** (size guide, shipping ETAs).

When a feature goes live, update: the relevant legal page, the notice component,
`TODO.md`, and this section.

---

## 10. Accessibility baseline

Target is WCAG 2.2 AA (a target, not a certification — stated on
`/legal/aksesibilitas`, which also lists known gaps honestly).

Already in place, do not regress: skip link, always-visible focus rings, ordered
headings and landmarks, descriptive image alt text naming the view, labelled
form fields with announced errors, `prefers-reduced-motion` support throughout,
Escape-to-close overlays.

---

## 11. SEO

`useSeo()` is the single entry point — it sets title/description, Open Graph,
Twitter, canonical, hreflang alternates, and JSON-LD (Organization + WebSite,
plus whatever the page passes). Every page must call it.

- Transactional pages (`cart`, `checkout`, confirmation) pass `noindex: true`,
  and are excluded from the sitemap so the two signals agree.
- Filtered catalogue views set `noindex` when any filter is active (thin
  duplicates).
- `/sitemap.xml` is a redirect; the real index is `/sitemap_index.xml`, which
  points at per-locale sitemaps (31 URLs each).
- Product and collection URLs come from `server/api/__sitemap__/urls.ts`.

---

## 12. Cart & checkout

- Quantities are **metres and may be fractional**. `normalizeMeters()` snaps
  every quantity to the product's `stepMeters`, respects `minOrderMeters`, and
  caps at stock. Never write a raw quantity into the store.
- Money is plain IDR integers. Formatting only happens in `useFormat()`.
- The cart persists to `localStorage` and is hydrated **after** first render by
  `plugins/app.client.ts`. Cart-dependent UI is wrapped in `<ClientOnly>` —
  reading storage during SSR would cause a hydration mismatch.
- `totals.shipping` is `null` until a method is chosen, and renders as
  "calculated at the next step" — never as free unless it genuinely is.
- `placeOrder()` records locally and clears the basket. It takes no payment.

---

## 13. Server routes

- `POST /api/contact` — validates via `server/utils/validation.ts` (deliberately
  independent of the client rules; the client copy is for fast feedback only),
  rate-limits per IP, and honours a honeypot field. The honeypot returns a
  **success shape** so bots learn nothing.
  It **logs but does not send email** — no transport is configured. Do not
  describe it as sending mail until that is wired.
- Rate limiting is in-memory: single-instance only. Move it to a durable store
  before any multi-instance deploy (tracked in `TODO.md`).

---

## 14. Git

Commits in this repository are authored as:

```
Maulana Yusup Abdullah <maulanayusupp@gmail.com>
```

Do not attribute commits to an AI agent. Commit and push each completed change.

---

## 15. Before you commit

```bash
npm run typecheck   # must be 0 errors
npm run check       # must pass
npm run build       # must complete with no warnings
```

Then confirm you have updated, where relevant: **this file**, `TODO.md`, both
locale files, and the affected compliance page.
