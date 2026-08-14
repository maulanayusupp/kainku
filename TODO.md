# TODO

Planned work, roughly in the order it should be tackled. Anything that would
change what the site *claims* must also update `CLAUDE.md` §9, the relevant
compliance page, and both locale files.

Status: `[ ]` not started · `[~]` in progress · `[x]` done

---

## P0 — required before this can take a real order

- [ ] **Payment gateway integration.**
      Wire a real provider (Midtrans / Xendit / HitPay) behind
      `services/payment.service.ts`. Checkout currently records the order in
      `localStorage` and takes no money.
      *On completion:* remove the demo notice from `checkout` and `konfirmasi`,
      update `/legal/ketentuan` §"Service status" and `/legal/disclaimer`.

- [ ] **Order persistence on the server.**
      `POST /api/orders` with server-side revalidation of prices and stock —
      never trust the basket the browser sends. Issue the authoritative order
      reference there; `buildOrderReference()` is a client-side placeholder.

- [ ] **Inventory management.**
      Real stock levels with reservation at checkout, so two buyers cannot take
      the same 3 metres. `stockMeters` in `app/data/products.ts` is static.

- [ ] **Contact form delivery.**
      `POST /api/contact` validates, rate-limits, and logs — but sends no email.
      Add a transport (Resend / Postmark / SES) and an autoresponder.
      Until then, do not describe the form as "sending" mail.

- [ ] **Durable rate limiting.**
      `server/utils/validation.ts` uses an in-memory Map: it resets on restart
      and is not shared between instances. Move to Redis/KV before scaling out.

- [ ] **Replace illustrative catalogue data.**
      Real prices, real stock, real lead times, real photography.
      *On completion:* remove `<SampleDataNotice>` usages and update
      `/legal/disclaimer`.

## P1 — commerce completeness

- [ ] Shipping rate API (per-destination pricing, real courier ETAs) instead of
      the three flat sample rates in `app/data/shipping.ts`.
- [ ] Order tracking page + status emails.
- [ ] Discount / voucher codes — `CartTotals.discount` exists and is wired
      through the summary, but is always `0`.
- [ ] Customer accounts: order history, saved addresses.
- [ ] Swatch ordering as a real product type (currently only mentioned in copy).
- [ ] Bulk / wholesale pricing tiers, with a quote request flow.
- [ ] Stock notification ("email me when back in stock") for sold-out items.
- [ ] Real product photography to sit alongside the generated vector views.

## P2 — UX and merchandising

- [ ] Wishlist / saved items.
- [ ] Recently viewed rail (`STORAGE_KEYS.recentlyViewed` is defined but unused).
- [ ] Dual-thumb price range filter — currently a single upper bound only.
- [ ] Numeric input alternative for the price slider (accessibility gap, listed
      on `/legal/aksesibilitas`).
- [ ] Pagination or infinite scroll on the catalogue — fine at 12 products,
      not at 200.
- [ ] Product comparison view (side-by-side width / weight / price).
- [ ] Fabric calculator: enter a garment type and get a suggested length,
      building on `/panduan-ukuran`.
- [ ] Zoom / lightbox on the product gallery macro view.
- [ ] Dark mode toggle. The token system already supports it — `.theme-ink`
      defines a complete dark palette; it needs a persisted user preference and
      a `prefers-color-scheme` default.

## P3 — engineering

- [~] **Tests.** A headless harness exists (`npm run test`, happy-dom +
      esbuild) and currently covers `app/utils/reveal.ts` — added after a
      scroll-reveal regression rendered pages blank on client-side navigation.
      Remaining high-value targets, in order: `cart.service`
      (`normalizeMeters`, `calculateTotals`, free-shipping threshold),
      `utils/validate`, `utils/format`, `product.service` filtering and
      sorting. Then component tests for `BaseQuantity` and the checkout form.
      Consider moving to Vitest once there is more than one suite.
- [ ] ESLint + Prettier config and a pre-commit hook. Code is written to a
      consistent style but nothing enforces it.
- [ ] CI: run `npm run verify` and `npm run build` on every push.
- [ ] Move `app/data/products.ts` behind a CMS or database; `services/` is
      already the seam for this — make the functions async and nothing else
      needs to change.
- [ ] Error monitoring (Sentry) and privacy-respecting analytics.
      *On completion:* update `/legal/cookie` and add a consent mechanism
      **before** any cookie-setting script goes live.
- [ ] Image pipeline: `@nuxt/image` for real photography once it exists.
      Generated SVGs need no processing.
- [ ] Lighthouse / Core Web Vitals budget in CI.

## P4 — content and reach

- [ ] Third language (e.g. `jv` or `zh`). The i18n layer is already structured
      for it: add a locale entry, copy the four JSON files, and `npm run check`
      will list every key still missing.
- [ ] Journal / editorial section on motifs and regions — good for organic
      search and for giving the cultural notes more room.
- [ ] Care-guide detail pages per fibre type.
- [ ] Verify the cultural notes in `products.json` against proper sources and
      cite them. They are currently condensed general knowledge, flagged as such
      on `/legal/disclaimer`.
- [ ] Real Instagram link (the footer currently points at instagram.com).
- [ ] Set `NUXT_PUBLIC_WHATSAPP` to the shop's number in international format
      without `+` (e.g. `62812xxxxxxx`). The WhatsApp button in the footer and
      on the contact page stays hidden until it is set. Note this is separate
      from WhatsApp *link previews*, which already work.
- [ ] Point the canonical origin at a custom domain when one is registered:
      set `NUXT_PUBLIC_SITE_URL`, then update `SITE.url` in
      `app/constants/site.ts` and `legal.appliesToValue` in both locale files.

---

## Known limitations (deliberate, documented)

These are accepted for now and stated publicly on the relevant compliance page:

- Focus trapping in overlays is basic and does not cycle fully.
- Contrast ratios for secondary text have not been verified across every
  combination.
- No screen-reader testing has been done across browser/AT combinations.
- Order data lives only in the visitor's browser.
- `/sitemap.xml` is an HTML redirect to `/sitemap_index.xml` (module behaviour);
  `robots.txt` correctly advertises the index.
