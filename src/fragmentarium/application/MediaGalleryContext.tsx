import { createContext } from 'react'
import type MediaRepository from 'fragmentarium/application/MediaRepository'
import type MediaBinaryLoader from 'fragmentarium/application/MediaBinaryLoader'

export interface MediaGalleryServices {
  readonly sessionKey?: string
  readonly repository: MediaRepository
  readonly binaryLoader: MediaBinaryLoader
}

export const MediaGalleryContext = createContext<MediaGalleryServices | null>(
  null,
)
