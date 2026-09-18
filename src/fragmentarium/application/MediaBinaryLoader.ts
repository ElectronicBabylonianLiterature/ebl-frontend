import type { ThumbnailSize } from 'fragmentarium/domain/media'

export type MediaBinaryRepresentation = 'original' | 'display' | ThumbnailSize

export interface MediaBinaryRequest {
  readonly fragmentNumber: string
  readonly mediaId: string
  readonly representation: MediaBinaryRepresentation
}

export default interface MediaBinaryLoader {
  fetch(request: MediaBinaryRequest, signal?: AbortSignal): Promise<Blob>
}
