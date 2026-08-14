<script setup lang="ts">
import { submitContactMessage } from '~/services/contact.service'
import { CONTACT_TOPICS, type ContactTopic } from '~/types/contact'
import { email as emailRule, maxLength, minLength, required, validateForm } from '~/utils/validate'

const { t } = useI18n()
const config = useRuntimeConfig()
const localePath = useLocalePath()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  topic: 'pemesanan' as ContactTopic,
  message: '',
  /** Honeypot — see `contact-form__trap` in the stylesheet. */
  company: '',
})

const submitted = ref(false)
const isSending = ref(false)
const result = ref<{ ok: boolean; messageKey: string; reference?: string } | null>(null)

const validation = computed(() =>
  validateForm(form as unknown as Record<string, unknown>, {
    name: [required(), minLength(2)],
    email: [required(), emailRule()],
    message: [required(), minLength(10), maxLength(4000)],
  }),
)

const errorFor = (field: string): string | undefined => {
  if (!submitted.value) return undefined
  const key = (validation.value.errors as Record<string, string | undefined>)[field]
  return key ? t(key) : undefined
}

async function submit() {
  submitted.value = true
  result.value = null
  if (!validation.value.isValid) {
    await nextTick()
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }

  isSending.value = true
  result.value = await submitContactMessage({ ...form })
  isSending.value = false

  if (result.value.ok) {
    form.message = ''
    submitted.value = false
  }
}

const contactEmail = config.public.contactEmail as string
const whatsapp = config.public.whatsapp as string

const crumbs = computed(() => [{ label: t('nav.home'), to: '/' }, { label: t('nav.contact') }])

useSeo(() => ({
  title: t('seo.contact.title'),
  description: t('seo.contact.description'),
}))
</script>

<template>
  <div>
    <PageHero
      :eyebrow="t('contact.eyebrow')"
      :title="t('contact.title')"
      :lead="t('contact.lead')"
      :crumbs="crumbs"
    />

    <section class="u-section--tight">
      <div class="u-container">
        <div class="contact-layout">
          <aside class="contact-aside">
            <div class="contact-card">
              <p class="contact-card__label">{{ t('contact.emailLabel') }}</p>
              <p class="contact-card__value">
                <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
              </p>
              <p class="contact-card__note">{{ t('contact.emailNote') }}</p>
            </div>

            <div v-if="whatsapp" class="contact-card">
              <p class="contact-card__label">{{ t('contact.whatsappLabel') }}</p>
              <p class="contact-card__value">
                <a :href="`https://wa.me/${whatsapp}`" target="_blank" rel="noopener noreferrer">
                  {{ t('footer.whatsapp') }}
                </a>
              </p>
            </div>

            <div class="contact-card">
              <p class="contact-card__label">{{ t('contact.hoursLabel') }}</p>
              <p class="contact-card__note">{{ t('footer.hours') }}</p>
              <p class="contact-card__note">{{ t('contact.responseNote') }}</p>
            </div>

            <div class="contact-card">
              <p class="contact-card__label">{{ t('contact.ownerLabel') }}</p>
              <p class="contact-card__value">Maulana Yusup Abdullah</p>
              <p class="contact-card__note">{{ t('contact.ownerNote') }}</p>
            </div>
          </aside>

          <form class="contact-form" novalidate @submit.prevent="submit">
            <div
              v-if="result"
              class="contact-form__status"
              :class="result.ok ? 'contact-form__status--success' : 'contact-form__status--error'"
              role="status"
            >
              <BaseIcon :name="result.ok ? 'check' : 'alert'" class="notice__icon" />
              <span>
                {{ t(result.messageKey) }}
                <template v-if="result.reference">({{ result.reference }})</template>
              </span>
            </div>

            <div class="contact-form__row">
              <BaseField :label="t('contact.field.name')" :error="errorFor('name')" required>
                <template #default="{ id, describedBy, invalid }">
                  <input
                    :id="id"
                    v-model="form.name"
                    type="text"
                    class="control"
                    autocomplete="name"
                    :aria-describedby="describedBy"
                    :aria-invalid="invalid || undefined"
                  >
                </template>
              </BaseField>

              <BaseField :label="t('contact.field.email')" :error="errorFor('email')" required>
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
            </div>

            <div class="contact-form__row">
              <BaseField
                :label="t('contact.field.phone')"
                :optional-text="t('common.optional')"
              >
                <template #default="{ id }">
                  <input
                    :id="id"
                    v-model="form.phone"
                    type="tel"
                    class="control"
                    autocomplete="tel"
                    inputmode="tel"
                  >
                </template>
              </BaseField>

              <BaseField :label="t('contact.field.topic')" required>
                <template #default="{ id }">
                  <select :id="id" v-model="form.topic" class="control control--select">
                    <option v-for="topic in CONTACT_TOPICS" :key="topic" :value="topic">
                      {{ t(`contact.topic.${topic}`) }}
                    </option>
                  </select>
                </template>
              </BaseField>
            </div>

            <BaseField
              :label="t('contact.field.message')"
              :hint="t('contact.hint.message')"
              :error="errorFor('message')"
              required
            >
              <template #default="{ id, describedBy, invalid }">
                <textarea
                  :id="id"
                  v-model="form.message"
                  class="control control--textarea"
                  rows="6"
                  :aria-describedby="describedBy"
                  :aria-invalid="invalid || undefined"
                />
              </template>
            </BaseField>

            <!-- Honeypot. Never visible; a filled value marks the post as a bot. -->
            <div class="contact-form__trap" aria-hidden="true">
              <label for="contact-company">Company</label>
              <input
                id="contact-company"
                v-model="form.company"
                type="text"
                tabindex="-1"
                autocomplete="off"
              >
            </div>

            <p class="t-xs t-subtle">
              <i18n-t scope="global" keypath="contact.privacyNote" tag="span">
                <template #privacy>
                  <NuxtLink :to="localePath('/legal/privasi')">{{ t('nav.legal.privacy') }}</NuxtLink>
                </template>
              </i18n-t>
            </p>

            <BaseButton type="submit" variant="accent" size="lg" :loading="isSending">
              <BaseIcon name="send" class="btn__icon" />
              {{ isSending ? t('contact.sending') : t('cta.sendMessage') }}
            </BaseButton>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
