/**
 * Server-side validation for the contact endpoint.
 *
 * Deliberately independent of the client rules in `app/utils/validate.ts`: the
 * browser copy exists for fast feedback, this one is the gate that actually
 * decides whether a payload is accepted. Never delete one in favour of the other.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
const PHONE_ID_RE = /^(?:\+?62|0)8[1-9][0-9]{6,11}$/
const TOPICS = new Set(['pemesanan', 'grosir', 'kustom', 'lainnya'])

export interface CleanContact {
  name: string
  email: string
  phone: string
  topic: string
  message: string
}

/** Removes control characters and trims to a maximum length. */
function clean(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength)
}

/**
 * Validates and normalises a contact payload.
 * @returns the cleaned record, or a list of field names that failed.
 */
export function parseContactPayload(
  body: unknown,
): { ok: true; data: CleanContact } | { ok: false; fields: string[] } {
  const input = (body ?? {}) as Record<string, unknown>
  const fields: string[] = []

  // Honeypot: a real browser never fills this, so treat it as spam. It is
  // reported as a generic failure so bots learn nothing from the response.
  if (clean(input.company, 100).length > 0) {
    return { ok: false, fields: ['spam'] }
  }

  const name = clean(input.name, 120)
  const email = clean(input.email, 200).toLowerCase()
  const phone = clean(input.phone, 40).replace(/[\s-]/g, '')
  const topic = clean(input.topic, 40)
  const message = clean(input.message, 4000)

  if (name.length < 2) fields.push('name')
  if (!EMAIL_RE.test(email)) fields.push('email')
  // Phone is optional, but must be well-formed when supplied.
  if (phone && !PHONE_ID_RE.test(phone)) fields.push('phone')
  if (!TOPICS.has(topic)) fields.push('topic')
  if (message.length < 10) fields.push('message')

  if (fields.length) return { ok: false, fields }
  return { ok: true, data: { name, email, phone, topic, message } }
}

/* -------------------------------------------------------------------------- */
/* Rate limiting                                                              */
/* -------------------------------------------------------------------------- */

const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

/**
 * In-memory fixed-window limiter.
 *
 * Adequate for a single-instance deployment only — it resets on restart and is
 * not shared between instances. Moving this to a durable store is tracked in
 * TODO.md before any multi-instance deploy.
 */
export function isRateLimited(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS)

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent)
    return true
  }

  recent.push(now)
  hits.set(key, recent)

  // Opportunistic cleanup so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [entryKey, times] of hits) {
      if (times.every((time) => now - time >= WINDOW_MS)) hits.delete(entryKey)
    }
  }

  return false
}
