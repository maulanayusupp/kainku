export type ContactTopic = 'pemesanan' | 'grosir' | 'kustom' | 'lainnya'

export interface ContactPayload {
  name: string
  email: string
  phone: string
  topic: ContactTopic
  message: string
  /**
   * Honeypot. Real users never see this field, so any non-empty value marks the
   * submission as automated. Named innocuously on purpose.
   */
  company?: string
}

export interface ContactResult {
  ok: boolean
  /** i18n key describing the outcome, resolved by the calling component. */
  messageKey: string
  reference?: string
}

export const CONTACT_TOPICS: ContactTopic[] = ['pemesanan', 'grosir', 'kustom', 'lainnya']
