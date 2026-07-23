import { ThumbnailSize } from 'fragmentarium/domain/media'

export type MediaBinaryRepresentation = 'original' | ThumbnailSize

export interface MediaBinaryRequest {
  readonly mediaId: string
  readonly url: string
  readonly representation: MediaBinaryRepresentation
}

export default interface MediaBinaryLoader {
  fetch(request: MediaBinaryRequest): Promise<Blob>
}
