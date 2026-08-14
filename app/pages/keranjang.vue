<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const { t } = useI18n()
const cart = useCartStore()

const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('nav.cart') }])

useSeo(() => ({
  title: t('seo.cart.title'),
  description: t('seo.cart.description'),
  // A personal basket has nothing useful to offer a search engine.
  noindex: true,
}))
</script>

<template>
  <div>
    <PageHero :title="t('cart.pageTitle')" :lead="t('cart.pageLead')" :crumbs="crumbs" />

    <section class="u-section--tight">
      <div class="u-container">
        <ClientOnly>
          <div v-if="!cart.isEmpty" class="cart-layout">
            <div class="cart-panel">
              <div class="cart-panel__head">
                <h2 class="cart-panel__title">{{ t('cart.itemsTitle') }}</h2>
                <span class="t-sm t-subtle">{{ t('catalogue.itemCount', cart.itemCount) }}</span>
              </div>

              <CartLineItem
                v-for="line in cart.resolvedLines"
                :key="line.productId"
                :line="line"
              />

              <div class="u-cluster u-section--tight">
                <BaseButton variant="ghost" to="/katalog">
                  <BaseIcon name="arrow-left" class="btn__icon" />
                  {{ t('cta.continueShopping') }}
                </BaseButton>
                <BaseButton variant="danger" size="sm" @click="cart.clear()">
                  {{ t('cart.clear') }}
                </BaseButton>
              </div>
            </div>

            <div class="u-stack">
              <ShippingProgress :total-meters="cart.totals.totalMeters" />

              <OrderSummary>
                <BaseButton variant="accent" size="lg" block to="/checkout">
                  {{ t('cta.checkout') }}
                  <BaseIcon name="arrow-right" class="btn__icon" />
                </BaseButton>
                <p class="t-xs t-subtle">{{ t('cart.shippingAtCheckout') }}</p>
              </OrderSummary>

              <SampleDataNotice />
            </div>
          </div>

          <EmptyState
            v-else
            icon="cart"
            :title="t('cart.emptyTitle')"
            :text="t('cart.emptyText')"
          >
            <BaseButton variant="accent" size="lg" to="/katalog">
              {{ t('cta.browseCatalogue') }}
            </BaseButton>
          </EmptyState>

          <template #fallback>
            <div class="cart-layout">
              <div class="skeleton skeleton--card" />
            </div>
          </template>
        </ClientOnly>
      </div>
    </section>
  </div>
</template>
