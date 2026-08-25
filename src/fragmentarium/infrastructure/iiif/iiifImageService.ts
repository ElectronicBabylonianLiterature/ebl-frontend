import {
  ImageComplianceLevel,
  ImageServiceDescriptor,
  ImageServiceSize,
  ImageServiceTiles,
  isImageComplianceLevel,
} from 'fragmentarium/domain/mediaImageService'
import { IiifServiceDto } from 'fragmentarium/infrastructure/iiif/iiifDtos'
import {
  boundArray,
  isRecord,
  normalizeAllowedUrl,
  normalizePositiveInteger,
  normalizeResourceType,
  toArray,
} from 'fragmentarium/infrastructure/iiif/iiifValidation'

export const supportedImageServiceTypes = [
  'ImageService3',
  'ImageService2',
] as const

const complianceLevelPattern = /level([012])/

function normalizeComplianceLevel(
  value: unknown,
): ImageComplianceLevel | undefined {
  if (isImageComplianceLevel(value)) {
    return value
  }
  if (typeof value !== 'string') {
    return undefined
  }
  const matched = complianceLevelPattern.exec(value)
  return matched === null
    ? undefined
    : (`level${matched[1]}` as ImageComplianceLevel)
}

function normalizeSize(value: unknown): ImageServiceSize | undefined {
  if (!isRecord(value)) {
    return undefined
  }
  const width = normalizePositiveInteger(value.width)
  const height = normalizePositiveInteger(value.height)
  return width !== undefined && height !== undefined
    ? { width, height }
    : undefined
}

function normalizeTiles(value: unknown): ImageServiceTiles | undefined {
  if (!isRecord(value)) {
    return undefined
  }
  const width = normalizePositiveInteger(value.width)
  const scaleFactors = boundArray(toArray(value.scaleFactors))
    .map((factor) => normalizePositiveInteger(factor))
    .filter((factor): factor is number => factor !== undefined)
  if (width === undefined || scaleFactors.length === 0) {
    return undefined
  }
  const height = normalizePositiveInteger(value.height)
  return { width, scaleFactors, ...(height !== undefined ? { height } : {}) }
}

function normalizeList<Item>(
  value: unknown,
  normalize: (entry: unknown) => Item | undefined,
): readonly Item[] {
  return boundArray(toArray(value))
    .map(normalize)
    .filter((entry): entry is Item => entry !== undefined)
}

function isSupportedServiceType(serviceType: string): boolean {
  return (supportedImageServiceTypes as readonly string[]).includes(serviceType)
}

function optionalNumbers(dto: IiifServiceDto): Partial<ImageServiceDescriptor> {
  const width = normalizePositiveInteger(dto.width)
  const height = normalizePositiveInteger(dto.height)
  const maxWidth = normalizePositiveInteger(dto.maxWidth)
  const maxHeight = normalizePositiveInteger(dto.maxHeight)
  const maxArea = normalizePositiveInteger(dto.maxArea)
  return {
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...(maxWidth !== undefined ? { maxWidth } : {}),
    ...(maxHeight !== undefined ? { maxHeight } : {}),
    ...(maxArea !== undefined ? { maxArea } : {}),
  }
}

export function normalizeImageService(
  value: unknown,
  allowedOrigins: readonly string[],
): ImageServiceDescriptor | undefined {
  if (!isRecord(value)) {
    return undefined
  }
  const dto = value as IiifServiceDto
  const serviceType = normalizeResourceType(dto)
  if (serviceType === undefined || !isSupportedServiceType(serviceType)) {
    return undefined
  }
  const id = normalizeAllowedUrl(dto.id ?? dto['@id'], allowedOrigins)
  if (id === undefined) {
    return undefined
  }
  const complianceLevel = normalizeComplianceLevel(dto.profile)
  const tiles = normalizeList(dto.tiles, normalizeTiles)
  const sizes = normalizeList(dto.sizes, normalizeSize)
  return {
    id,
    serviceType,
    ...(complianceLevel !== undefined ? { complianceLevel } : {}),
    ...optionalNumbers(dto),
    ...(tiles.length > 0 ? { tiles } : {}),
    ...(sizes.length > 0 ? { sizes } : {}),
  }
}

export function selectImageServiceFromBody(
  service: unknown,
  allowedOrigins: readonly string[],
): ImageServiceDescriptor | undefined {
  for (const candidate of boundArray(toArray(service))) {
    const normalized = normalizeImageService(candidate, allowedOrigins)
    if (normalized !== undefined) {
      return normalized
    }
  }
  return undefined
}

export function imageInfoUrl(service: ImageServiceDescriptor): string {
  return `${service.id.replace(/\/$/, '')}/info.json`
}
