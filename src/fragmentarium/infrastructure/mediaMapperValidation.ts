const UNSAFE_URL_CHARACTERS = /[\\?#]/
const TRAVERSAL_SEGMENT = '..'

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function normalizeNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalizedValue = value.trim()
  return normalizedValue === '' ? undefined : normalizedValue
}

export function normalizeRelativeMediaUrl(value: unknown): string | undefined {
  const url = normalizeNonEmptyString(value)
  if (url === undefined || !url.startsWith('/') || url.startsWith('//')) {
    return undefined
  }

  if (UNSAFE_URL_CHARACTERS.test(url)) {
    return undefined
  }

  return url.split('/').includes(TRAVERSAL_SEGMENT) ? undefined : url
}

export function normalizeNonNegativeInteger(
  value: unknown,
): number | undefined {
  return Number.isInteger(value) && (value as number) >= 0
    ? (value as number)
    : undefined
}

export function normalizePositiveInteger(value: unknown): number | undefined {
  return Number.isInteger(value) && (value as number) > 0
    ? (value as number)
    : undefined
}
