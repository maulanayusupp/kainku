import { isRateLimited, parseContactPayload } from '../utils/validation'

/**
 * Receives contact-form submissions.
 *
 * IMPORTANT: this endpoint validates, rate-limits and logs the message, but it
 * does NOT deliver email — no mail transport is configured in this build. The
 * response says the message was received, which is true; wiring an actual
 * provider is tracked in TODO.md ("Contact form delivery"). Do not describe
 * this as sending mail until that is done.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = parseContactPayload(body)

  // Client IP for rate limiting. Falls back to a constant when unavailable,
  // which means an unknown-IP flood shares one bucket — acceptable here.
  const ip =
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getRequestHeader(event, 'x-real-ip') ||
    'unknown'

  if (isRateLimited(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }

  if (!parsed.ok) {
    // The honeypot case is answered with a success shape on purpose: a bot that
    // sees a 400 learns which field betrayed it.
    if (parsed.fields[0] === 'spam') {
      return { ok: true, messageKey: 'contact.success' }
    }
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation Failed',
      data: { fields: parsed.fields },
    })
  }

  const config = useRuntimeConfig(event)
  const reference = `KK-C-${Date.now().toString(36).toUpperCase()}`

  // Structured log so the message is not lost while delivery is unconfigured.
  console.info('[contact] received', {
    reference,
    inbox: config.contactInbox,
    topic: parsed.data.topic,
    from: parsed.data.email,
    length: parsed.data.message.length,
  })

  return { ok: true, messageKey: 'contact.success', reference }
})
