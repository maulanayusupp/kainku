<script setup lang="ts">
import { PAYMENT_METHODS, SHIPPING_METHODS } from '~/data/shipping'
import { useCartStore } from '~/stores/cart'
import type { CheckoutCustomer, PaymentMethodId, ShippingMethodId } from '~/types/cart'
import { STORAGE_KEYS, readStorage, writeStorage } from '~/utils/storage'
import { email, isTrue, minLength, phoneId, postalCodeId, required, validateForm } from '~/utils/validate'

/**
 * Checkout.
 *
 * IMPORTANT: no payment is taken and no stock is reserved. Submitting records
 * the order locally and shows a reference so the flow has a realistic end
 * state. This is stated on the page itself — see the notice above the submit
 * button — and integrating a real gateway is tracked in TODO.md.
 */
const { t } = useI18n()
const cart = useCartStore()
const localePath = useLocalePath()
const { price } = useFormat()

const form = reactive<CheckoutCustomer>({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  postalCode: '',
  notes: '',
})

const agreed = ref(false)
const submitted = ref(false)
const isSubmitting = ref(false)

// Restore a half-filled form so a refresh is not punished.
onMounted(() => {
  const saved = readStorage<Partial<CheckoutCustomer> | null>(STORAGE_KEYS.checkout, null)
  if (saved) Object.assign(form, saved)
  if (!cart.shippingMethod) cart.setShippingMethod('regular')
})

watch(form, (value) => writeStorage(STORAGE_KEYS.checkout, value), { deep: true })

const validation = computed(() =>
  validateForm(
    { ...form, agreed: agreed.value } as Record<string, unknown>,
    {
      fullName: [required(), minLength(2)],
      email: [required(), email()],
      phone: [required(), phoneId()],
      address: [required(), minLength(8)],
      city: [required()],
      province: [required()],
      postalCode: [required(), postalCodeId()],
      agreed: [isTrue()],
    },
  ),
)

/** Errors are only surfaced after a submit attempt, not while typing. */
const errorFor = (field: string): string | undefined => {
  if (!submitted.value) return undefined
  const key = (validation.value.errors as Record<string, string | undefined>)[field]
  return key ? t(key) : undefined
}

const shippingOptions = computed(() =>
  SHIPPING_METHODS.map((method) => ({
    ...method,
    // Free-shipping rule is applied against the current basket, not assumed.
    effectivePrice:
      method.id === 'regular' && cart.totals.totalMeters >= 10 ? 0 : method.price,
  })),
)

async function submit() {
  submitted.value = true
  if (!validation.value.isValid || cart.isEmpty) {
    // Move focus to the first problem so the error is not missed.
    await nextTick()
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }

  isSubmitting.value = true
  const order = cart.placeOrder({
    customer: { ...form },
    shippingMethod: cart.shippingMethod ?? 'regular',
    paymentMethod: cart.paymentMethod,
    agreedToTerms: agreed.value,
  })
  isSubmitting.value = false

  await navigateTo({
    path: localePath('/checkout/konfirmasi'),
    query: { ref: order.reference },
  })
}

useSeo(() => ({
  title: t('seo.checkout.title'),
  description: t('seo.checkout.description'),
  noindex: true,
}))
</script>

<template>
  <div>
    <PageHero :title="t('checkout.title')" :lead="t('checkout.lead')" />

    <section class="u-section--tight">
      <div class="u-container">
        <ol class="steps">
          <li class="steps__item steps__item--done">
            <span class="steps__num">1</span>{{ t('checkout.step.cart') }}
          </li>
          <li class="steps__item steps__item--active">
            <span class="steps__num">2</span>{{ t('checkout.step.details') }}
          </li>
          <li class="steps__item">
            <span class="steps__num">3</span>{{ t('checkout.step.confirm') }}
          </li>
        </ol>

        <ClientOnly>
          <EmptyState
            v-if="cart.isEmpty"
            icon="cart"
            :title="t('cart.emptyTitle')"
            :text="t('checkout.emptyText')"
          >
            <BaseButton variant="accent" size="lg" to="/katalog">
              {{ t('cta.browseCatalogue') }}
            </BaseButton>
          </EmptyState>

          <form v-else class="checkout-layout" novalidate @submit.prevent="submit">
            <div>
              <section class="checkout-section">
                <header class="checkout-section__head">
                  <span class="checkout-section__num" aria-hidden="true">1</span>
                  <h2 class="checkout-section__title">{{ t('checkout.contactTitle') }}</h2>
                </header>

                <div class="checkout-grid">
                  <BaseField
                    :label="t('checkout.field.fullName')"
                    :error="errorFor('fullName')"
                    required
                  >
                    <template #default="{ id, describedBy, invalid }">
                      <input
                        :id="id"
                        v-model="form.fullName"
                        type="text"
                        class="control"
                        autocomplete="name"
                        :aria-describedby="describedBy"
                        :aria-invalid="invalid || undefined"
                      >
                    </template>
                  </BaseField>

                  <BaseField :label="t('checkout.field.email')" :error="errorFor('email')" required>
                    <template #default="{ id, describedBy, invalid }">
                      <input
                        :id="id"
                        v-model="form.email"
                        type="email"
                        class="control"
                        autocomplete="email"
                        :aria-describedby="describedBy"
                        :aria-invalid="invalid || undefined"
                      >
                    </template>
                  </BaseField>

                  <BaseField
                    class="checkout-grid__full"
                    :label="t('checkout.field.phone')"
                    :hint="t('checkout.hint.phone')"
                    :error="errorFor('phone')"
                    required
                  >
                    <template #default="{ id, describedBy, invalid }">
                      <input
                        :id="id"
                        v-model="form.phone"
                        type="tel"
                        class="control"
                        autocomplete="tel"
                        inputmode="tel"
                        :aria-describedby="describedBy"
                        :aria-invalid="invalid || undefined"
                      >
                    </template>
                  </BaseField>
                </div>
              </section>

              <section class="checkout-section">
                <header class="checkout-section__head">
                  <span class="checkout-section__num" aria-hidden="true">2</span>
                  <h2 class="checkout-section__title">{{ t('checkout.addressTitle') }}</h2>
                </header>

                <div class="checkout-grid">
                  <BaseField
                    class="checkout-grid__full"
                    :label="t('checkout.field.address')"
                    :error="errorFor('address')"
                    required
                  >
                    <template #default="{ id, describedBy, invalid }">
                      <textarea
                        :id="id"
                        v-model="form.address"
                        class="control control--textarea"
                        autocomplete="street-address"
                        rows="3"
                        :aria-describedby="describedBy"
                        :aria-invalid="invalid || undefined"
                      />
                    </template>
                  </BaseField>

                  <BaseField :label="t('checkout.field.city')" :error="errorFor('city')" required>
                    <template #default="{ id, describedBy, invalid }">
                      <input
                        :id="id"
                        v-model="form.city"
                        type="text"
                        class="control"
                        autocomplete="address-level2"
                        :aria-describedby="describedBy"
                        :aria-invalid="invalid || undefined"
                      >
                    </template>
                  </BaseField>

                  <BaseField
                    :label="t('checkout.field.province')"
                    :error="errorFor('province')"
                    required
                  >
                    <template #default="{ id, describedBy, invalid }">
                      <input
                        :id="id"
                        v-model="form.province"
                        type="text"
                        class="control"
                        autocomplete="address-level1"
                        :aria-describedby="describedBy"
                        :aria-invalid="invalid || undefined"
                      >
                    </template>
                  </BaseField>

                  <BaseField
                    :label="t('checkout.field.postalCode')"
                    :error="errorFor('postalCode')"
                    required
                  >
                    <template #default="{ id, describedBy, invalid }">
                      <input
                        :id="id"
                        v-model="form.postalCode"
                        type="text"
                        class="control"
                        autocomplete="postal-code"
                        inputmode="numeric"
                        maxlength="5"
                        :aria-describedby="describedBy"
                        :aria-invalid="invalid || undefined"
                      >
                    </template>
                  </BaseField>

                  <BaseField
                    class="checkout-grid__full"
                    :label="t('checkout.field.notes')"
                    :optional-text="t('common.optional')"
                  >
                    <template #default="{ id }">
                      <textarea
                        :id="id"
                        v-model="form.notes"
                        class="control control--textarea"
                        rows="2"
                        :placeholder="t('checkout.hint.notes')"
                      />
                    </template>
                  </BaseField>
                </div>
              </section>

              <section class="checkout-section">
                <header class="checkout-section__head">
                  <span class="checkout-section__num" aria-hidden="true">3</span>
                  <h2 class="checkout-section__title">{{ t('checkout.shippingTitle') }}</h2>
                </header>

                <div class="option-list">
                  <label
                    v-for="method in shippingOptions"
                    :key="method.id"
                    class="option-card"
                  >
                    <input
                      type="radio"
                      name="shipping"
                      :value="method.id"
                      :checked="cart.shippingMethod === method.id"
                      @change="cart.setShippingMethod(method.id as ShippingMethodId)"
                    >
                    <span class="option-card__body">
                      <span class="option-card__title">
                        {{ t(`checkout.shipping.${method.id}.name`) }}
                      </span>
                      <span class="option-card__meta">
                        {{ t(`checkout.shipping.${method.id}.desc`) }} ·
                        {{ t('checkout.eta', { min: method.etaDaysMin, max: method.etaDaysMax }) }}
                      </span>
                    </span>
                    <span class="option-card__price">
                      {{ method.effectivePrice === 0 ? t('cart.free') : price(method.effectivePrice) }}
                    </span>
                  </label>
                </div>
              </section>

              <section class="checkout-section">
                <header class="checkout-section__head">
                  <span class="checkout-section__num" aria-hidden="true">4</span>
                  <h2 class="checkout-section__title">{{ t('checkout.paymentTitle') }}</h2>
                </header>

                <div class="option-list">
                  <label v-for="method in PAYMENT_METHODS" :key="method" class="option-card">
                    <input
                      type="radio"
                      name="payment"
                      :value="method"
                      :checked="cart.paymentMethod === method"
                      @change="cart.setPaymentMethod(method as PaymentMethodId)"
                    >
                    <span class="option-card__body">
                      <span class="option-card__title">{{ t(`checkout.payment.${method}.name`) }}</span>
                      <span class="option-card__meta">{{ t(`checkout.payment.${method}.desc`) }}</span>
                    </span>
                  </label>
                </div>

                <p class="notice notice--warning">
                  <BaseIcon name="alert" class="notice__icon" />
                  <span>
                    <strong class="notice__title">{{ t('checkout.demoNotice.title') }}</strong>
                    {{ t('checkout.demoNotice.body') }}
                  </span>
                </p>
              </section>
            </div>

            <div class="u-stack">
              <OrderSummary show-lines :title="t('checkout.summaryTitle')">
                <label class="choice">
                  <input v-model="agreed" type="checkbox" :aria-invalid="Boolean(errorFor('agreed')) || undefined">
                  <span class="choice__text">
                    <i18n-t scope="global" keypath="checkout.agreeTerms" tag="span">
                      <template #terms>
                        <NuxtLink :to="localePath('/legal/ketentuan')">
                          {{ t('nav.legal.terms') }}
                        </NuxtLink>
                      </template>
                      <template #privacy>
                        <NuxtLink :to="localePath('/legal/privasi')">
                          {{ t('nav.legal.privacy') }}
                        </NuxtLink>
                      </template>
                    </i18n-t>
                  </span>
                </label>

                <p v-if="errorFor('agreed')" class="field__error" role="alert">
                  <BaseIcon name="alert" class="field__error-icon" />
                  {{ errorFor('agreed') }}
                </p>

                <BaseButton
                  type="submit"
                  variant="accent"
                  size="lg"
                  block
                  :loading="isSubmitting"
                >
                  {{ t('cta.placeOrder') }}
                  <BaseIcon name="arrow-right" class="btn__icon" />
                </BaseButton>

                <BaseButton variant="ghost" to="/keranjang" block>
                  {{ t('cta.backToCart') }}
                </BaseButton>
              </OrderSummary>
            </div>
          </form>
        </ClientOnly>
      </div>
    </section>
  </div>
</template>
