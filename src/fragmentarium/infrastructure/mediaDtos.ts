import { ThumbnailSize } from 'fragmentarium/domain/media'

export interface MediaRepresentationDto {
  readonly url?: unknown
  readonly mimeType?: unknown
  readonly width?: unknown
  readonly height?: unknown
}

export interface MediaRepresentationsDto {
  readonly original?: unknown
  readonly display?: unknown
  readonly thumbnails?: unknown
}

export interface MediaSummaryPrimaryDto {
  readonly id?: unknown
  readonly type?: unknown
  readonly thumbnail?: unknown
}

export interface MediaSummaryDto {
  readonly count?: unknown
  readonly types?: unknown
  readonly primary?: unknown
}

export interface MediaReferenceDto {
  readonly id?: unknown
}

export interface MediaResourceDto {
  readonly id?: unknown
  readonly type?: unknown
  readonly sortOrder?: unknown
  readonly isPrimary?: unknown
  readonly caption?: unknown
  readonly attribution?: unknown
  readonly references?: unknown
  readonly representations?: unknown
}

export interface FragmentMediaResponseDto {
  readonly media?: unknown
}

export interface MediaSummaryCompatibilityDto {
  readonly mediaSummary?: unknown
  readonly hasPhoto?: unknown
  readonly thumbnailPath?: unknown
}

export type ThumbnailDtoMap = Readonly<
  Partial<Record<ThumbnailSize, MediaRepresentationDto>>
>
