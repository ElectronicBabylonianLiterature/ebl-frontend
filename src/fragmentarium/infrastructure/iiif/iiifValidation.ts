export const allowedUrlScheme = 'https:'
export const maximumCanvases = 500
export const maximumMetadataEntries = 100
export const maximumArrayItems = 1000
export const maximumDisplayStringLength = 1000

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function toArray(value: unknown): readonly unknown[] {
  if (Array.isArray(value)) {
    return value
  }
  return value === undefined || value === null ? [] : [value]
}

export function boundArray(
  value: readonly unknown[],
  limit: number = maximumArrayItems,
): readonly unknown[] {
  return value.length > limit ? value.slice(0, limit) : value
}

export function normalizeNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function normalizeDisplayString(value: unknown): string | undefined {
  const normalized = normalizeNonEmptyString(value)
  if (normalized === undefined) {
    return undefined
  }
  return normalized.length > maximumDisplayStringLength
    ? normalized.slice(0, maximumDisplayStringLength)
    : normalized
}

export function normalizePositiveInteger(value: unknown): number | undefined {
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    value > 0 &&
    Number.isFinite(value)
    ? value
    : undefined
}

function parseUrl(value: string): URL | undefined {
  try {
    return new URL(value)
  } catch {
    return undefined
  }
}

export function normalizeAbsoluteHttpsUrl(value: unknown): string | undefined {
  const candidate = normalizeNonEmptyString(value)
  if (candidate === undefined) {
    return undefined
  }
  const parsed = parseUrl(candidate)
  if (parsed === undefined || parsed.protocol !== allowedUrlScheme) {
    return undefined
  }
  return parsed.href
}

export function toOrigin(value: string): string | undefined {
  const parsed = parseUrl(value)
  if (parsed === undefined || parsed.protocol !== allowedUrlScheme) {
    return undefined
  }
  return parsed.origin
}

export function configuredIiifOrigins(): readonly string[] {
  const apiOrigin = toOrigin(process.env.REACT_APP_DICTIONARY_API_URL ?? '')
  return apiOrigin === undefined ? [] : [apiOrigin]
}

export function isAllowedOrigin(
  url: string,
  allowedOrigins: readonly string[],
): boolean {
  const origin = toOrigin(url)
  return origin !== undefined && allowedOrigins.includes(origin)
}

export function normalizeAllowedUrl(
  value: unknown,
  allowedOrigins: readonly string[],
): string | undefined {
  const url = normalizeAbsoluteHttpsUrl(value)
  if (url === undefined || !isAllowedOrigin(url, allowedOrigins)) {
    return undefined
  }
  return url
}

export function normalizeResourceId(value: unknown): string | undefined {
  return isRecord(value)
    ? normalizeAbsoluteHttpsUrl(value.id ?? value['@id'])
    : normalizeAbsoluteHttpsUrl(value)
}

export function normalizeResourceType(value: unknown): string | undefined {
  if (!isRecord(value)) {
    return undefined
  }
  const type = value.type ?? value['@type']
  return typeof type === 'string' ? type : undefined
}

export function hasResourceType(value: unknown, expected: string): boolean {
  return normalizeResourceType(value) === expected
}

export function normalizeStringArray(value: unknown): readonly string[] {
  return boundArray(toArray(value))
    .map((entry) => normalizeDisplayString(entry))
    .filter((entry): entry is string => entry !== undefined)
}

export function normalizeStrictStringArray(value: unknown): readonly string[] {
  return Array.isArray(value) ? normalizeStringArray(value) : []
}
