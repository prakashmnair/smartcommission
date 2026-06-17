/**
 * PII masking utilities for SmartCommission.
 * Use these in all log calls, admin views, and data export endpoints.
 * Never log raw PII — always mask before writing to any log sink.
 */

/**
 * Masks an email address: "john.doe@example.com" → "joh***@example.com"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '[redacted]'
  const [local, domain] = email.split('@')
  if (!domain) return '[redacted]'
  const visible = local.slice(0, 3)
  return `${visible}***@${domain}`
}

/**
 * Masks a full name: "John Doe" → "J*** D***"
 */
export function maskName(name: string | null | undefined): string {
  if (!name) return '[redacted]'
  return name
    .split(' ')
    .map(part => (part.length > 0 ? `${part[0]}***` : ''))
    .join(' ')
}

/**
 * Masks a phone number: "+61412345678" → "+614***5678"
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '[redacted]'
  if (phone.length <= 4) return '***'
  return phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4)
}

/**
 * Masks an IP address: "203.0.113.42" → "203.0.***.***"
 */
export function maskIp(ip: string | null | undefined): string {
  if (!ip) return '[redacted]'
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`
  }
  // IPv6 — mask everything after the first two segments
  const v6parts = ip.split(':')
  return `${v6parts[0]}:${v6parts[1]}:***`
}

/**
 * Scrubs known PII fields from an arbitrary object before logging.
 */
export function scrubPii(obj: Record<string, unknown>): Record<string, unknown> {
  const PII_FIELDS = new Set([
    'email', 'userEmail', 'name', 'dob', 'dateOfBirth',
    'phone', 'phoneNumber', 'location', 'ipAddress', 'ip',
    'userAgent', 'password', 'token', 'apiKey',
  ])

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (PII_FIELDS.has(key)) {
      if (key === 'email' || key === 'userEmail') {
        result[key] = maskEmail(value as string)
      } else if (key === 'ipAddress' || key === 'ip') {
        result[key] = maskIp(value as string)
      } else if (key === 'name') {
        result[key] = maskName(value as string)
      } else {
        result[key] = '[redacted]'
      }
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = scrubPii(value as Record<string, unknown>)
    } else {
      result[key] = value
    }
  }
  return result
}
