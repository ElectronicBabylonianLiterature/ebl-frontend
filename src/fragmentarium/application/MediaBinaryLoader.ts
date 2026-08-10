import type { ThumbnailSize } from 'fragmentarium/domain/media'

export type MediaBinaryRepresentation = 'original' | 'display' | ThumbnailSize

export interface MediaBinaryRequest {
  readonly mediaId: string
  readonly url: string
  readonly representation: MediaBinaryRepresentation
}

export default interface MediaBinaryLoader {
  fetch(request: MediaBinaryRequest, signal?: AbortSignal): Promise<Blob>
}
