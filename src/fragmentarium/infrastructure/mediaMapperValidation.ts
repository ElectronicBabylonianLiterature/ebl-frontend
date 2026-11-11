const UNSAFE_URL_CHARACTERS = /[\\#]/
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

function decodeUrlSegment(segment: string): string | undefined {
  try {
    return decodeURIComponent(segment)
  } catch {
    return undefined
  }
}

function isFragmentMediaQuery(
  pathname: string,
  query: string,
  extraQuery: string | undefined,
): boolean {
  if (
    extraQuery !== undefined ||
    !/^\/media\/[^/]+\/(file|display|thumbnail\/(small|medium|large))$/.test(
      pathname,
    ) ||
    !query.startsWith('fragment=') ||
    query.includes('&')
  ) {
    return false
  }
  const fragment = decodeUrlSegment(query.slice('fragment='.length))
  return (
    fragment !== undefined &&
    fragment.trim().length > 0 &&
    !hasControlCharacter(fragment) &&
    !fragment.split('/').includes(TRAVERSAL_SEGMENT)
  )
}

function isRootRelativePath(url: string): boolean {
  return (
    url.startsWith('/') &&
    !url.startsWith('//') &&
    !UNSAFE_URL_CHARACTERS.test(url) &&
    !hasControlCharacter(url)
  )
}

function hasSafeQuery(url: string): boolean {
  const [pathname, query, extraQuery] = url.split('?')
  return (
    query === undefined || isFragmentMediaQuery(pathname, query, extraQuery)
  )
}

function hasSafeSegments(url: string): boolean {
  const segments = url.split('?')[0].split('/')
  const decodedSegments = segments.flatMap((segment) => {
    const decodedSegment = decodeUrlSegment(segment)
    return decodedSegment === undefined
      ? [undefined]
      : decodedSegment.split('/')
  })
  return (
    !decodedSegments.includes(undefined) &&
    !decodedSegments.includes(TRAVERSAL_SEGMENT) &&
    !decodedSegments.some(
      (segment) => segment !== undefined && hasControlCharacter(segment),
    ) &&
    segments.slice(1).some((segment) => segment !== '')
  )
}

export function normalizeRelativeMediaUrl(value: unknown): string | undefined {
  const url = normalizeNonEmptyString(value)
  return url !== undefined &&
    isRootRelativePath(url) &&
    hasSafeQuery(url) &&
    hasSafeSegments(url)
    ? url
    : undefined
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
