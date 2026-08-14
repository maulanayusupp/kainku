/**
 * Form validation primitives.
 *
 * Rules return an i18n KEY (never a sentence) so the same rule set drives both
 * locales. `validateForm()` is used by the contact form and by checkout, and is
 * mirrored on the server in `server/utils/validation.ts` — never trust the
 * client-side pass alone.
 */

export type ValidationKey = string
/**
 * A rule takes the raw field value — deliberately `unknown`, because every rule
 * below coerces internally. Typing it as `string` would make a rule map
 * unusable against a form object whose fields have mixed types.
 */
export type Rule<T = unknown> = (value: T) => ValidationKey | null
export type Errors<T> = Partial<Record<keyof T, ValidationKey>>

/** Matches the overwhelming majority of real addresses without over-rejecting. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

/** Indonesian mobile numbers: 08xx…, +628xx…, or 628xx…, 9–15 digits total. */
const PHONE_ID_RE = /^(?:\+?62|0)8[1-9][0-9]{6,11}$/

const POSTAL_ID_RE = /^[0-9]{5}$/

export const required =
  (key = 'validation.required'): Rule =>
  (value) =>
    value != null && String(value).trim().length > 0 ? null : key

export const minLength =
  (min: number, key = 'validation.minLength'): Rule =>
  (value) =>
    String(value ?? '').trim().length >= min ? null : key

export const maxLength =
  (max: number, key = 'validation.maxLength'): Rule =>
  (value) =>
    String(value ?? '').trim().length <= max ? null : key

export const email =
  (key = 'validation.email'): Rule =>
  (value) =>
    EMAIL_RE.test(String(value ?? '').trim()) ? null : key

export const phoneId =
  (key = 'validation.phone'): Rule =>
  (value) =>
    PHONE_ID_RE.test(String(value ?? '').replace(/[\s-]/g, '')) ? null : key

export const postalCodeId =
  (key = 'validation.postalCode'): Rule =>
  (value) =>
    POSTAL_ID_RE.test(String(value ?? '').trim()) ? null : key

export const isTrue =
  (key = 'validation.mustAccept'): Rule =>
  (value) =>
    value === true ? null : key

/** Runs rules in order and returns the first failure, or `null`. */
export function firstError(value: unknown, rules: Rule[]): ValidationKey | null {
  for (const rule of rules) {
    const error = rule(value)
    if (error) return error
  }
  return null
}

/**
 * Validates a whole object against a rule map.
 *
 * @example
 * const { errors, isValid } = validateForm(form, {
 *   name: [required(), minLength(2)],
 *   email: [required(), email()],
 * })
 */
export function validateForm<T extends Record<string, unknown>>(
  values: T,
  schema: Partial<Record<keyof T, Rule[]>>,
): { errors: Errors<T>; isValid: boolean } {
  const errors: Errors<T> = {}
  for (const field of Object.keys(schema) as (keyof T)[]) {
    const rules = schema[field]
    if (!rules?.length) continue
    const error = firstError(values[field], rules)
    if (error) errors[field] = error
  }
  return { errors, isValid: Object.keys(errors).length === 0 }
}

/**
 * Strips characters that have no place in a plain-text field before the value
 * is stored or echoed back. Not a substitute for output encoding — Vue already
 * escapes interpolated text — but it keeps stored data clean.
 */
export function sanitizeText(value: string, maxLength = 2000): string {
  return value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, maxLength)
}
