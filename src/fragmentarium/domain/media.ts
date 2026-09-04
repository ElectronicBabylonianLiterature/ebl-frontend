export const MediaTypes = ['PHOTO', 'COPY'] as const

export type MediaType = (typeof MediaTypes)[number]

export const ThumbnailSizes = ['small', 'medium', 'large'] as const

export type ThumbnailSize = (typeof ThumbnailSizes)[number]

export const RasterMediaMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export type RasterMediaMimeType = (typeof RasterMediaMimeTypes)[number]

export const SvgMediaMimeType = 'image/svg+xml'

export type OriginalMediaMimeType =
  | RasterMediaMimeType
  | typeof SvgMediaMimeType

export interface MediaReference {
  readonly id: string
}

export interface RasterMediaRepresentation {
  readonly url: string
  readonly mimeType: RasterMediaMimeType
  readonly width?: number
  readonly height?: number
}

export interface OriginalMediaRepresentation {
  readonly url: string
  readonly mimeType: OriginalMediaMimeType
  readonly width?: number
  readonly height?: number
}

export interface MediaRepresentations {
  readonly original: OriginalMediaRepresentation
  readonly display?: RasterMediaRepresentation
  readonly thumbnails: Readonly<
    Partial<Record<ThumbnailSize, RasterMediaRepresentation>>
  >
}

export interface MediaSummaryPrimary {
  readonly id: string
  readonly type: MediaType
  readonly thumbnail?: RasterMediaRepresentation
}

export interface MediaSummary {
  readonly count: number
  readonly types: readonly MediaType[]
  readonly primary?: MediaSummaryPrimary
}

export interface MediaResource {
  readonly id: string
  readonly type: MediaType
  readonly sortOrder: number
  readonly isPrimary: boolean
  readonly caption?: string
  readonly attribution?: string
  readonly references: readonly MediaReference[]
  readonly representations: MediaRepresentations
}

export interface FragmentMedia {
  readonly media: readonly MediaResource[]
}

export function isMediaType(value: unknown): value is MediaType {
  return (
    typeof value === 'string' &&
    (MediaTypes as readonly string[]).includes(value)
  )
}

export function isThumbnailSize(value: unknown): value is ThumbnailSize {
  return (
    typeof value === 'string' &&
    (ThumbnailSizes as readonly string[]).includes(value)
  )
}

export function isRasterMediaMimeType(
  value: unknown,
): value is RasterMediaMimeType {
  return (
    typeof value === 'string' &&
    (RasterMediaMimeTypes as readonly string[]).includes(value)
  )
}

export function isSvgMediaMimeType(
  value: unknown,
): value is typeof SvgMediaMimeType {
  return value === SvgMediaMimeType
}

export function isOriginalMediaMimeType(
  value: unknown,
): value is OriginalMediaMimeType {
  return isRasterMediaMimeType(value) || isSvgMediaMimeType(value)
}

export function isSvgAllowedAsOriginal(mediaType: MediaType): boolean {
  return mediaType === 'COPY'
}
