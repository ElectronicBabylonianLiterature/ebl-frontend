import {
  IiifReference,
  presentationVersion,
} from 'fragmentarium/domain/iiifDocument'
import {
  FragmentIiifDiscoveryDto,
  IiifReferenceDto,
} from 'fragmentarium/infrastructure/iiif/iiifDtos'
import {
  configuredIiifOrigins,
  isRecord,
  normalizeAllowedUrl,
} from 'fragmentarium/infrastructure/iiif/iiifValidation'

function isSupportedVersion(value: unknown): boolean {
  return value === undefined || value === null || value === presentationVersion
}

export function normalizeIiifReference(
  value: unknown,
  allowedOrigins: readonly string[] = configuredIiifOrigins(),
): IiifReference | undefined {
  if (!isRecord(value)) {
    return undefined
  }
  const dto = value as IiifReferenceDto
  if (!isSupportedVersion(dto.version)) {
    return undefined
  }
  const manifestUrl = normalizeAllowedUrl(dto.manifest, allowedOrigins)
  return manifestUrl === undefined
    ? undefined
    : { manifestUrl, presentationVersion }
}

export function normalizeFragmentIiifReference(
  dto: FragmentIiifDiscoveryDto,
  allowedOrigins: readonly string[] = configuredIiifOrigins(),
): IiifReference | undefined {
  return normalizeIiifReference(dto.iiif, allowedOrigins)
}
