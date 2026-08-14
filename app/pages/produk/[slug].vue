<script setup lang="ts">
import { SITE } from '~/constants/site'
import { getProductBySlug, getRelatedProducts } from '~/services/product.service'
import { normalizeMeters } from '~/services/cart.service'

const route = useRoute()
const { t, locale } = useI18n()
const config = useRuntimeConfig()
const localePath = useLocalePath()
const { price, meters, discountPercent } = useFormat()
const { localize } = useProductContent()
const { addToCart } = useCartActions()

const slug = computed(() => String(route.params.slug))
const product = computed(() => getProductBySlug(slug.value))

// A missing slug is a genuine 404, not an empty page.
if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product Not Found', fatal: true })
}

const item = computed(() => product.value!)
const content = computed(() => localize(item.value))
const related = computed(() => getRelatedProducts(slug.value, 4))

const isSoldOut = computed(() => item.value.stockMeters <= 0)
const isLowStock = computed(() => !isSoldOut.value && item.value.stockMeters <= 15)

const quantity = ref(item.value.minOrderMeters)
watch(item, (next) => {
  quantity.value = next.minOrderMeters
})

const maxMeters = computed(() => Math.min(item.value.stockMeters, 200))
const lineTotal = computed(() => item.value.pricePerMeter * quantity.value)

const saving = computed(() =>
  item.value.compareAtPrice
    ? discountPercent(item.value.compareAtPrice, item.value.pricePerMeter)
    : 0,
)

function add() {
  addToCart(item.value, normalizeMeters(item.value, quantity.value), { openDrawer: true })
}

const crumbs = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.catalogue'), to: '/katalog' },
  {
    label: t(`catalogue.category.${item.value.category}`),
    to: `/koleksi/${item.value.category}`,
  },
  { label: content.value.name },
])

const siteUrl = (config.public.siteUrl as string) || SITE.url

useSeo(() => ({
  title: content.value.name,
  description: content.value.tagline,
  // Raster, not the SVG swatch: WhatsApp/Instagram/Facebook ignore SVG.
  image: item.value.ogImage[locale.value === 'en' ? 'en' : 'id'],
  type: 'product',
  jsonLd: [
    {
      '@type': 'Product',
      name: content.value.name,
      description: content.value.description,
      sku: item.value.id,
      image: item.value.images.map((image) => `${siteUrl}${image.src}`),
      category: t(`catalogue.category.${item.value.category}`),
      brand: { '@type': 'Brand', name: SITE.name },
      offers: {
        '@type': 'Offer',
        price: item.value.pricePerMeter,
        priceCurrency: 'IDR',
        // Per metre — stated explicitly so the figure is not read as a unit price.
        unitText: 'meter',
        availability: isSoldOut.value
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
        url: `${siteUrl}${localePath(`/produk/${item.value.slug}`)}`,
      },
    },
    breadcrumbJsonLd(
      [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.catalogue'), path: '/katalog' },
        { name: content.value.name, path: `/produk/${item.value.slug}` },
      ],
      siteUrl,
    ),
  ],
}))
</script>

<template>
  <div>
    <section class="u-section--tight" :class="`swatch--${item.palette}`">
      <div class="u-container">
        <AppBreadcrumbs :items="crumbs" />

        <div class="pdp u-section--tight">
          <ProductGallery :product="item" />

          <div class="pdp__panel">
            <div class="pdp__eyebrow">
              <span class="badge">{{ t(`catalogue.category.${item.category}`) }}</span>
              <span class="badge badge--dot">{{ item.region }}</span>
            </div>

            <h1 class="pdp__title">{{ content.name }}</h1>
            <p class="pdp__tagline">{{ content.tagline }}</p>

            <div class="pdp__price-row">
              <span class="pdp__price">{{ price(item.pricePerMeter) }}</span>
              <span class="pdp__price-unit">{{ t('product.perMeter') }}</span>
              <template v-if="item.compareAtPrice">
                <span class="pdp__compare">{{ price(item.compareAtPrice) }}</span>
                <span class="badge badge--sale">-{{ saving }}%</span>
              </template>
            </div>

            <p
              class="pdp__stock"
              :class="
                isSoldOut ? 'pdp__stock--out' : isLowStock ? 'pdp__stock--low' : 'pdp__stock--in'
              "
            >
              <span class="pdp__stock-dot" aria-hidden="true" />
              <template v-if="isSoldOut">{{ t('product.stockOut') }}</template>
              <template v-else-if="isLowStock">
                {{ t('product.stockLow', { meters: meters(item.stockMeters) }) }}
              </template>
              <template v-else>
                {{ t('product.stockIn', { meters: meters(item.stockMeters) }) }}
              </template>
            </p>

            <div class="pdp__buy">
              <div class="pdp__qty-row">
                <span class="pdp__qty-label">
                  <span>{{ t('product.length') }}</span>
                  <span class="t-xs t-subtle">
                    {{ t('product.minOrder', { meters: meters(item.minOrderMeters) }) }}
                  </span>
                </span>

                <BaseQuantity
                  v-model="quantity"
                  :min="item.minOrderMeters"
                  :max="maxMeters"
                  :step="item.stepMeters"
                  :disabled="isSoldOut"
                  :label="t('product.lengthLabel')"
                />

                <span class="pdp__qty-total">{{ price(lineTotal) }}</span>
              </div>

              <BaseButton
                variant="accent"
                size="lg"
                block
                :disabled="isSoldOut"
                @click="add()"
              >
                <BaseIcon name="cart" class="btn__icon" />
                {{ isSoldOut ? t('product.soldOut') : t('cta.addToCart') }}
              </BaseButton>

              <BaseButton variant="outline" to="/kontak" block>
                {{ t('cta.askAboutFabric') }}
              </BaseButton>
            </div>

            <div class="pdp__specs">
              <span class="spec-pill">
                <span class="spec-pill__label">{{ t('product.spec.width') }}</span>
                <span class="spec-pill__value">{{ item.widthCm }} cm</span>
              </span>
              <span class="spec-pill">
                <span class="spec-pill__label">{{ t('product.spec.weight') }}</span>
                <span class="spec-pill__value">{{ item.weightGsm }} gsm</span>
              </span>
              <span class="spec-pill">
                <span class="spec-pill__label">{{ t('product.spec.material') }}</span>
                <span class="spec-pill__value">
                  {{ item.materials.map((m) => t(`catalogue.material.${m}`)).join(' · ') }}
                </span>
              </span>
            </div>

            <div class="pdp__section">
              <h2 class="pdp__section-title">{{ t('product.aboutTitle') }}</h2>
              <p class="pdp__body">{{ content.description }}</p>
            </div>

            <div v-if="content.bestFor.length" class="pdp__section">
              <h2 class="pdp__section-title">{{ t('product.bestForTitle') }}</h2>
              <ul class="pdp__list">
                <li v-for="use in content.bestFor" :key="use" class="pdp__list-item">{{ use }}</li>
              </ul>
            </div>

            <div v-if="content.care.length" class="pdp__section">
              <h2 class="pdp__section-title">{{ t('product.careTitle') }}</h2>
              <ul class="pdp__list">
                <li v-for="tip in content.care" :key="tip" class="pdp__list-item">{{ tip }}</li>
              </ul>
            </div>

            <div class="pdp__section">
              <h2 class="pdp__section-title">{{ t('product.specTitle') }}</h2>
              <table class="spec-table">
                <tbody>
                  <tr>
                    <th scope="row">{{ t('product.spec.origin') }}</th>
                    <td>{{ item.region }}</td>
                  </tr>
                  <tr>
                    <th scope="row">{{ t('product.spec.technique') }}</th>
                    <td>{{ t(`catalogue.category.${item.category}`) }}</td>
                  </tr>
                  <tr>
                    <th scope="row">{{ t('product.spec.width') }}</th>
                    <td>{{ item.widthCm }} cm</td>
                  </tr>
                  <tr>
                    <th scope="row">{{ t('product.spec.weight') }}</th>
                    <td>{{ item.weightGsm }} gsm</td>
                  </tr>
                  <tr>
                    <th scope="row">{{ t('product.spec.cut') }}</th>
                    <td>{{ meters(item.stepMeters) }}</td>
                  </tr>
                  <tr>
                    <th scope="row">{{ t('product.spec.sku') }}</th>
                    <td>{{ item.id.toUpperCase() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="pdp__section">
              <h2 class="pdp__section-title">{{ t('product.storyTitle') }}</h2>
              <p class="pdp__body">{{ content.story }}</p>
            </div>

            <SampleDataNotice />
          </div>
        </div>
      </div>
    </section>

    <section v-if="related.length" class="u-section band">
      <div class="u-container">
        <SectionHeading :eyebrow="t('product.relatedEyebrow')" :title="t('product.relatedTitle')" />
        <ProductGrid :products="related" :eager-count="0" />
      </div>
    </section>

    <!-- Sticky purchase bar for small screens. -->
    <div class="buy-bar">
      <div class="buy-bar__price">
        <span class="buy-bar__value">{{ price(lineTotal) }}</span>
        <span class="buy-bar__unit">{{ meters(quantity) }}</span>
      </div>
      <BaseButton
        class="buy-bar__action"
        variant="accent"
        block
        :disabled="isSoldOut"
        @click="add()"
      >
        {{ isSoldOut ? t('product.soldOut') : t('cta.addToCart') }}
      </BaseButton>
    </div>
  </div>
</template>
