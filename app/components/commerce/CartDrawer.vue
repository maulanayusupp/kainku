<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

/**
 * Slide-out basket.
 *
 * Wrapped in `<ClientOnly>` at the layout level because its contents come from
 * localStorage — rendering it on the server would guarantee a hydration
 * mismatch on the item count.
 */
const cart = useCartStore()
const { t } = useI18n()
const { price } = useFormat()

const panel = ref<HTMLElement | null>(null)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && cart.isDrawerOpen) cart.closeDrawer()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

watch(
  () => cart.isDrawerOpen,
  async (open) => {
    if (!open) return
    await nextTick()
    panel.value?.querySelector<HTMLElement>('button, a')?.focus()
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="cart.isDrawerOpen" class="backdrop" @click="cart.closeDrawer()" />
    </Transition>

    <Transition name="drawer-slide">
      <aside
        v-if="cart.isDrawerOpen"
        ref="panel"
        class="drawer"
        role="dialog"
        aria-modal="true"
        :aria-label="t('cart.title')"
      >
        <header class="drawer__head">
          <h2 class="drawer__title">
            {{ t('cart.title') }}
            <span v-if="cart.itemCount" class="t-sm t-subtle">({{ cart.itemCount }})</span>
          </h2>
          <BaseButton
            variant="ghost"
            icon-only
            :aria-label="t('common.close')"
            @click="cart.closeDrawer()"
          >
            <BaseIcon name="close" class="btn__icon" />
          </BaseButton>
        </header>

        <div class="drawer__body">
          <template v-if="!cart.isEmpty">
            <CartLineItem
              v-for="line in cart.resolvedLines"
              :key="line.productId"
              :line="line"
              compact
            />
          </template>

          <EmptyState
            v-else
            icon="cart"
            :title="t('cart.emptyTitle')"
            :text="t('cart.emptyText')"
          >
            <BaseButton variant="primary" to="/katalog" @click="cart.closeDrawer()">
              {{ t('cta.browseCatalogue') }}
            </BaseButton>
          </EmptyState>
        </div>

        <footer v-if="!cart.isEmpty" class="drawer__foot">
          <ShippingProgress :total-meters="cart.totals.totalMeters" />

          <div class="summary__total">
            <span>{{ t('cart.subtotal') }}</span>
            <span>{{ price(cart.totals.subtotal) }}</span>
          </div>

          <p class="t-xs t-subtle">{{ t('cart.shippingAtCheckout') }}</p>

          <div class="u-stack u-stack--sm">
            <BaseButton variant="accent" size="lg" to="/checkout" block>
              {{ t('cta.checkout') }}
              <BaseIcon name="arrow-right" class="btn__icon" />
            </BaseButton>
            <BaseButton variant="ghost" to="/keranjang" block>
              {{ t('cta.viewCart') }}
            </BaseButton>
          </div>
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>
