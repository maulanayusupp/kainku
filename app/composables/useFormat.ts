import {
  discountPercent,
  formatDate,
  formatMeters,
  formatNumber,
  formatPrice,
  formatPriceCompact,
} from '~/utils/format'

/**
 * Locale-bound wrappers around the pure formatters in `utils/format.ts`.
 *
 * Components use this instead of the raw helpers so nobody has to remember to
 * thread the current locale through, and switching language re-renders prices
 * and dates automatically.
 */
export function useFormat() {
  const { locale } = useI18n()

  const intlLocale = computed(() => (locale.value === 'en' ? 'en-US' : 'id-ID'))

  return {
    intlLocale,
    price: (amount: number) => formatPrice(amount, intlLocale.value),
    priceCompact: (amount: number) => formatPriceCompact(amount, intlLocale.value),
    meters: (value: number) => formatMeters(value, intlLocale.value),
    number: (value: number, maxFractionDigits?: number) =>
      formatNumber(value, intlLocale.value, maxFractionDigits),
    date: (value: string | Date) => formatDate(value, intlLocale.value),
    discountPercent,
  }
}
