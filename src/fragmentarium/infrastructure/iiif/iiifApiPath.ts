import {
  isAllowedOrigin,
  normalizeAbsoluteHttpsUrl,
} from 'fragmentarium/infrastructure/iiif/iiifValidation'

export function configuredApiBaseUrl(): string {
  return process.env.REACT_APP_DICTIONARY_API_URL ?? ''
}

export function toApiPath(
  url: string,
  allowedOrigins: readonly string[],
  baseUrl: string = configuredApiBaseUrl(),
): string | undefined {
  const normalized = normalizeAbsoluteHttpsUrl(url)
  if (
    normalized === undefined ||
    !isAllowedOrigin(normalized, allowedOrigins) ||
    baseUrl === ''
  ) {
    return undefined
  }
  const base = baseUrl.replace(/\/$/, '')
  if (!normalized.startsWith(`${base}/`)) {
    return undefined
  }
  return normalized.slice(base.length)
}
