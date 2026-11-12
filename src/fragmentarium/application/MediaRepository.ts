import type { MediaResource } from 'fragmentarium/domain/media'

export default interface MediaRepository {
  findGallery?(
    fragmentNumber: string,
    signal?: AbortSignal,
  ): Promise<MediaGalleryResponse>
  findByFragment(
    fragmentNumber: string,
    signal?: AbortSignal,
  ): Promise<readonly MediaResource[]>
}

export interface MediaGalleryResponse {
  readonly media: readonly MediaResource[]
  readonly legacyFallbackAllowed?: boolean
}

export class UnsupportedMediaResponseError extends Error {
  constructor(
    message?: string,
    readonly legacyFallbackAllowed?: boolean,
  ) {
    super(message)
  }
}
