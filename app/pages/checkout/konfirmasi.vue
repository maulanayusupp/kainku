<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

/**
 * Post-order screen.
 *
 * Reads the order the store recorded locally. If someone lands here directly
 * (bookmark, refresh after clearing storage) there is nothing to show, so the
 * page says so rather than inventing an order.
 */
const { t } = useI18n()
const route = useRoute()
const cart = useCartStore()
const { price, date } = useFormat()

const reference = computed(() => (typeof route.query.ref === 'string' ? route.query.ref : ''))

const order = computed(() => {
  const last = cart.lastOrder
  if (!last) return null
  // Only show it when the reference matches, so a stale order is not shown
  // against a fresh confirmation link.
  return !reference.value || last.reference === reference.value ? last : null
})

useSeo(() => ({
  title: t('seo.confirmation.title'),
  description: t('seo.confirmation.description'),
  noindex: true,
}))
</script>

<template>
  <section class="u-section">
    <div class="u-container">
      <ClientOnly>
        <div v-if="order" class="confirmation">
          <span class="confirmation__mark">
            <BaseIcon name="check" />
          </span>

          <h1 class="t-h1">{{ t('confirmation.title') }}</h1>
          <p class="t-lead">{{ t('confirmation.lead', { email: order.customer.email }) }}</p>

          <p class="confirmation__ref">
            <span class="t-xs t-subtle">{{ t('confirmation.reference') }}</span>
            {{ order.reference }}
          </p>

          <dl class="legal-meta">
            <div>
              <dt class="t-xs t-subtle">{{ t('confirmation.placedAt') }}</dt>
              <dd><strong>{{ date(order.placedAt) }}</strong></dd>
            </div>
            <div>
              <dt class="t-xs t-subtle">{{ t('confirmation.total') }}</dt>
              <dd><strong>{{ price(order.totals.grandTotal) }}</strong></dd>
            </div>
            <div>
              <dt class="t-xs t-subtle">{{ t('confirmation.shipping') }}</dt>
              <dd><strong>{{ t(`checkout.shipping.${order.shippingMethod}.name`) }}</strong></dd>
            </div>
            <div>
              <dt class="t-xs t-subtle">{{ t('confirmation.payment') }}</dt>
              <dd><strong>{{ t(`checkout.payment.${order.paymentMethod}.name`) }}</strong></dd>
            </div>
          </dl>

          <p class="notice notice--warning">
            <BaseIcon name="alert" class="notice__icon" />
            <span>
              <strong class="notice__title">{{ t('confirmation.demoNotice.title') }}</strong>
              {{ t('confirmation.demoNotice.body') }}
            </span>
          </p>

          <div class="u-cluster u-cluster--center">
            <BaseButton variant="accent" size="lg" to="/katalog">
              {{ t('cta.continueShopping') }}
            </BaseButton>
            <BaseButton variant="outline" size="lg" to="/kontak">
              {{ t('cta.talkToUs') }}
            </BaseButton>
          </div>
        </div>

        <EmptyState
          v-else
          icon="package"
          :title="t('confirmation.missingTitle')"
          :text="t('confirmation.missingText')"
        >
          <BaseButton variant="accent" to="/katalog">{{ t('cta.browseCatalogue') }}</BaseButton>
        </EmptyState>
      </ClientOnly>
    </div>
  </section>
</template>
