export const MediaTypes = ['PHOTO', 'COPY'] as const

export type MediaType = (typeof MediaTypes)[number]

export const ThumbnailSizes = ['small', 'medium', 'large'] as const

export type ThumbnailSize = (typeof ThumbnailSizes)[number]

export interface MediaReference {
  readonly id: string
}

export interface MediaRepresentation {
  readonly url: string
  readonly mimeType: string
  readonly width?: number
  readonly height?: number
}

export interface MediaRepresentations {
  readonly original: MediaRepresentation
  readonly thumbnails: Readonly<
    Partial<Record<ThumbnailSize, MediaRepresentation>>
  >
}

export interface MediaSummaryPrimary {
  readonly id: string
  readonly type: MediaType
  readonly thumbnail?: MediaRepresentation
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
