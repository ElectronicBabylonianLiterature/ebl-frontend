import {
  isRasterMediaMimeType,
  RasterMediaRepresentation,
} from 'fragmentarium/domain/media'
import { MediaRendering } from 'fragmentarium/domain/iiifMedia'
import { ImageServiceDescriptor } from 'fragmentarium/domain/mediaImageService'
import {
  IiifAnnotationDto,
  IiifCanvasDto,
  IiifContentResourceDto,
} from 'fragmentarium/infrastructure/iiif/iiifDtos'
import { selectImageServiceFromBody } from 'fragmentarium/infrastructure/iiif/iiifImageService'
import { resolveLanguageMap } from 'fragmentarium/infrastructure/iiif/iiifLanguageMap'
import {
  boundArray,
  hasResourceType,
  isRecord,
  normalizeAllowedUrl,
  normalizeDisplayString,
  normalizePositiveInteger,
  toArray,
} from 'fragmentarium/infrastructure/iiif/iiifValidation'

export const paintingMotivation = 'painting'

export interface NormalizedImageBody {
  readonly representation: RasterMediaRepresentation
  readonly imageService?: ImageServiceDescriptor
}

export function selectPaintingBodies(
  canvas: IiifCanvasDto,
): readonly unknown[] {
  return boundArray(toArray(canvas.items))
    .filter((page) => isRecord(page))
    .flatMap((page) => boundArray(toArray((page as { items?: unknown }).items)))
    .filter(
      (annotation): annotation is IiifAnnotationDto =>
        isRecord(annotation) &&
        (annotation as IiifAnnotationDto).motivation === paintingMotivation,
    )
    .flatMap((annotation) => boundArray(toArray(annotation.body)))
}

function dimensions(
  dto: IiifContentResourceDto,
): Partial<RasterMediaRepresentation> {
  const width = normalizePositiveInteger(dto.width)
  const height = normalizePositiveInteger(dto.height)
  return {
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
  }
}

export function normalizeImageBody(
  value: unknown,
  allowedOrigins: readonly string[],
): NormalizedImageBody | undefined {
  if (!isRecord(value) || !hasResourceType(value, 'Image')) {
    return undefined
  }
  const dto = value as IiifContentResourceDto
  const url = normalizeAllowedUrl(dto.id ?? dto['@id'], allowedOrigins)
  if (url === undefined || !isRasterMediaMimeType(dto.format)) {
    return undefined
  }
  const imageService = selectImageServiceFromBody(dto.service, allowedOrigins)
  return {
    representation: { url, mimeType: dto.format, ...dimensions(dto) },
    ...(imageService !== undefined ? { imageService } : {}),
  }
}

export function normalizeThumbnail(
  value: unknown,
  allowedOrigins: readonly string[],
): RasterMediaRepresentation | undefined {
  for (const candidate of boundArray(toArray(value))) {
    if (!isRecord(candidate)) {
      continue
    }
    const dto = candidate as IiifContentResourceDto
    const url = normalizeAllowedUrl(dto.id ?? dto['@id'], allowedOrigins)
    if (url !== undefined && isRasterMediaMimeType(dto.format)) {
      return { url, mimeType: dto.format, ...dimensions(dto) }
    }
  }
  return undefined
}

export function normalizeMediaAlternatives(
  value: unknown,
  allowedOrigins: readonly string[],
): readonly MediaRendering[] {
  return boundArray(toArray(value))
    .map((candidate) => {
      if (!isRecord(candidate)) {
        return undefined
      }
      const dto = candidate as IiifContentResourceDto
      const id = normalizeAllowedUrl(dto.id ?? dto['@id'], allowedOrigins)
      const label = resolveLanguageMap(dto.label)
      if (id === undefined || label === undefined) {
        return undefined
      }
      const format = normalizeDisplayString(dto.format)
      return { id, label, ...(format !== undefined ? { format } : {}) }
    })
    .filter((rendering): rendering is MediaRendering => rendering !== undefined)
}
