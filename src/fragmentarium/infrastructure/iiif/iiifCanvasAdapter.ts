import { IiifDiagnostic } from 'fragmentarium/domain/iiifDocument'
import {
  IiifMediaRepresentations,
  IiifMediaResource,
} from 'fragmentarium/domain/iiifMedia'
import { IiifCanvasDto } from 'fragmentarium/infrastructure/iiif/iiifDtos'
import {
  NormalizedImageBody,
  normalizeImageBody,
  normalizeMediaAlternatives,
  normalizeThumbnail,
  selectPaintingBodies,
} from 'fragmentarium/infrastructure/iiif/iiifCanvasBody'
import { resolveLanguageMap } from 'fragmentarium/infrastructure/iiif/iiifLanguageMap'
import {
  hasResourceType,
  isRecord,
  normalizeAllowedUrl,
  normalizePositiveInteger,
} from 'fragmentarium/infrastructure/iiif/iiifValidation'

export interface NormalizedCanvas {
  readonly media?: IiifMediaResource
  readonly diagnostics: readonly IiifDiagnostic[]
}

function dropped(detail: string): NormalizedCanvas {
  return { diagnostics: [{ code: 'CANVAS_DROPPED', detail }] }
}

function selectImageBody(
  canvas: IiifCanvasDto,
  allowedOrigins: readonly string[],
): NormalizedImageBody | undefined {
  for (const body of selectPaintingBodies(canvas)) {
    const normalized = normalizeImageBody(body, allowedOrigins)
    if (normalized !== undefined) {
      return normalized
    }
  }
  return undefined
}

function buildRepresentations(
  canvas: IiifCanvasDto,
  body: NormalizedImageBody,
  allowedOrigins: readonly string[],
): IiifMediaRepresentations {
  const thumbnail = normalizeThumbnail(canvas.thumbnail, allowedOrigins)
  return {
    original: body.representation,
    display: body.representation,
    thumbnails: {},
    ...(body.imageService !== undefined
      ? { imageService: body.imageService }
      : {}),
    ...(thumbnail !== undefined ? { thumbnail } : {}),
  }
}

function canvasDimensions(canvas: IiifCanvasDto): {
  readonly canvasWidth?: number
  readonly canvasHeight?: number
} {
  const canvasWidth = normalizePositiveInteger(canvas.width)
  const canvasHeight = normalizePositiveInteger(canvas.height)
  return {
    ...(canvasWidth !== undefined ? { canvasWidth } : {}),
    ...(canvasHeight !== undefined ? { canvasHeight } : {}),
  }
}

export function normalizeCanvas(
  value: unknown,
  sortOrder: number,
  allowedOrigins: readonly string[],
): NormalizedCanvas {
  if (!isRecord(value) || !hasResourceType(value, 'Canvas')) {
    return dropped('not a Canvas')
  }
  const canvas = value as IiifCanvasDto
  const id = normalizeAllowedUrl(canvas.id ?? canvas['@id'], allowedOrigins)
  if (id === undefined) {
    return dropped('missing or rejected Canvas id')
  }
  const body = selectImageBody(canvas, allowedOrigins)
  if (body === undefined) {
    return {
      diagnostics: [
        {
          code: 'UNSUPPORTED_BODY',
          detail: `no supported image body on ${id}`,
        },
      ],
    }
  }
  const label = resolveLanguageMap(canvas.label)
  const alternatives = normalizeMediaAlternatives(
    canvas.rendering,
    allowedOrigins,
  )
  const media: IiifMediaResource = {
    id,
    sortOrder,
    isPrimary: sortOrder === 0,
    references: [],
    representations: buildRepresentations(canvas, body, allowedOrigins),
    ...(label !== undefined ? { label } : {}),
    ...canvasDimensions(canvas),
    ...(alternatives.length > 0 ? { renderings: alternatives } : {}),
  }
  return {
    media,
    diagnostics:
      body.imageService === undefined
        ? [{ code: 'MISSING_IMAGE_SERVICE', detail: id }]
        : [],
  }
}
