<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const { shop, company, legal } = useNavigation()

const email = config.public.contactEmail as string
const whatsapp = config.public.whatsapp as string
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer theme-ink">
    <div class="footer__inner">
      <div class="footer__top">
        <div class="footer__brand">
          <img
            src="/images/brand/logo.svg"
            :alt="t('common.brandAlt')"
            class="footer__logo"
            width="180"
            height="41"
          >
          <p class="footer__blurb">{{ t('footer.blurb') }}</p>
          <div class="u-cluster">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              class="header__icon-btn"
              :aria-label="t('footer.instagram')"
            >
              <BaseIcon name="instagram" />
            </a>
            <a
              :href="`mailto:${email}`"
              class="header__icon-btn"
              :aria-label="t('footer.emailUs')"
            >
              <BaseIcon name="mail" />
            </a>
          </div>
        </div>

        <nav :aria-label="t('footer.shop')">
          <h2 class="footer__col-title">{{ t('footer.shop') }}</h2>
          <ul class="footer__links">
            <li v-for="link in shop" :key="link.to">
              <NuxtLink :to="localePath(link.to)" class="footer__link">
                {{ t(link.labelKey) }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <nav :aria-label="t('footer.company')">
          <h2 class="footer__col-title">{{ t('footer.company') }}</h2>
          <ul class="footer__links">
            <li v-for="link in company" :key="link.to">
              <NuxtLink :to="localePath(link.to)" class="footer__link">
                {{ t(link.labelKey) }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div>
          <h2 class="footer__col-title">{{ t('footer.contact') }}</h2>
          <address class="footer__contact">
            <div class="footer__contact-row">
              <BaseIcon name="mail" />
              <a :href="`mailto:${email}`">{{ email }}</a>
            </div>
            <div v-if="whatsapp" class="footer__contact-row">
              <BaseIcon name="chat" />
              <a :href="`https://wa.me/${whatsapp}`" target="_blank" rel="noopener noreferrer">
                {{ t('footer.whatsapp') }}
              </a>
            </div>
            <div class="footer__contact-row">
              <BaseIcon name="clock" />
              <span>{{ t('footer.hours') }}</span>
            </div>
            <div class="footer__contact-row">
              <BaseIcon name="pin" />
              <span>{{ t('footer.location') }}</span>
            </div>
          </address>
        </div>
      </div>

      <div class="footer__bottom">
        <p>{{ t('footer.copyright', { year }) }}</p>

        <nav class="footer__legal-links" :aria-label="t('nav.compliance')">
          <NuxtLink
            v-for="link in legal.slice(1)"
            :key="link.to"
            :to="localePath(link.to)"
            class="footer__legal-link"
          >
            {{ t(link.labelKey) }}
          </NuxtLink>
        </nav>
      </div>
    </div>

    <p class="footer__watermark" aria-hidden="true">Kainku</p>
  </footer>
</template>
