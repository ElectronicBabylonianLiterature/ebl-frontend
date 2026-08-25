import {
  IiifMetadataEntry,
  IiifProvider,
} from 'fragmentarium/domain/iiifDocument'
import {
  IiifMetadataEntryDto,
  IiifProviderDto,
} from 'fragmentarium/infrastructure/iiif/iiifDtos'
import {
  resolveLanguageMap,
  resolveLanguageMapText,
} from 'fragmentarium/infrastructure/iiif/iiifLanguageMap'
import {
  boundArray,
  isRecord,
  maximumMetadataEntries,
  normalizeAbsoluteHttpsUrl,
  toArray,
  toOrigin,
} from 'fragmentarium/infrastructure/iiif/iiifValidation'

export const rightsVocabularyOrigins: readonly string[] = [
  'https://creativecommons.org',
  'https://rightsstatements.org',
]

export function normalizeMetadataEntry(
  value: unknown,
): IiifMetadataEntry | undefined {
  if (!isRecord(value)) {
    return undefined
  }
  const dto = value as IiifMetadataEntryDto
  const label = resolveLanguageMap(dto.label)
  const entryValue = resolveLanguageMapText(dto.value)
  return label !== undefined && entryValue !== undefined
    ? { label, value: entryValue }
    : undefined
}

export function normalizeMetadata(
  value: unknown,
): readonly IiifMetadataEntry[] {
  return boundArray(toArray(value), maximumMetadataEntries)
    .map(normalizeMetadataEntry)
    .filter((entry): entry is IiifMetadataEntry => entry !== undefined)
}

export function normalizeExternalUrl(value: unknown): string | undefined {
  const candidate = isRecord(value)
    ? (value as { id?: unknown; '@id'?: unknown })
    : undefined
  return normalizeAbsoluteHttpsUrl(
    candidate === undefined ? value : (candidate.id ?? candidate['@id']),
  )
}

export function normalizeHomepage(value: unknown): string | undefined {
  for (const candidate of boundArray(toArray(value))) {
    const url = normalizeExternalUrl(candidate)
    if (url !== undefined) {
      return url
    }
  }
  return undefined
}

export function normalizeRights(value: unknown): string | undefined {
  const url = normalizeAbsoluteHttpsUrl(value)
  if (url === undefined) {
    return undefined
  }
  const origin = toOrigin(url)
  return origin !== undefined && rightsVocabularyOrigins.includes(origin)
    ? url
    : undefined
}

export function normalizeProvider(value: unknown): readonly IiifProvider[] {
  return boundArray(toArray(value), maximumMetadataEntries)
    .map((candidate) => {
      if (!isRecord(candidate)) {
        return undefined
      }
      const dto = candidate as IiifProviderDto
      const label = resolveLanguageMap(dto.label)
      if (label === undefined) {
        return undefined
      }
      const id = normalizeAbsoluteHttpsUrl(dto.id ?? dto['@id'])
      const homepage = normalizeHomepage(dto.homepage)
      return {
        label,
        ...(id !== undefined ? { id } : {}),
        ...(homepage !== undefined ? { homepage } : {}),
      }
    })
    .filter((provider): provider is IiifProvider => provider !== undefined)
}
