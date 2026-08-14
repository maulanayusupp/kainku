import type { ContactPayload, ContactResult } from '~/types/contact'

/**
 * Contact form transport.
 *
 * Posts to the app's own Nitro route rather than to a third party, so no
 * customer data leaves the origin. `server/api/contact.post.ts` re-validates
 * and decides what to do with the message.
 */
export async function submitContactMessage(payload: ContactPayload): Promise<ContactResult> {
  try {
    return await $fetch<ContactResult>('/api/contact', {
      method: 'POST',
      body: payload,
    })
  } catch (error) {
    const status = (error as { statusCode?: number })?.statusCode
    return {
      ok: false,
      // Keys, not sentences — the component renders them through i18n.
      messageKey: status === 429 ? 'contact.errors.rateLimited' : 'contact.errors.generic',
    }
  }
}
