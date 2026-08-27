const UNSAFE_URL_CHARACTERS = /[\\?#]/
const TRAVERSAL_SEGMENT = '..'

function hasControlCharacter(value: string): boolean {
  return [...value].some((character) => {
    const codePoint = character.charCodeAt(0)
    return codePoint <= 0x1f || codePoint === 0x7f
  })
}

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

function decodeUrlSegment(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

export function normalizeRelativeMediaUrl(value: unknown): string | undefined {
  const url = normalizeNonEmptyString(value)
  if (url === undefined || !url.startsWith('/') || url.startsWith('//')) {
    return undefined
  }

  if (UNSAFE_URL_CHARACTERS.test(url) || hasControlCharacter(url)) {
    return undefined
  }

  const segments = url.split('/')
  if (segments.map(decodeUrlSegment).includes(TRAVERSAL_SEGMENT)) {
    return undefined
  }

  return segments.slice(1).some((segment) => segment !== '') ? url : undefined
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
