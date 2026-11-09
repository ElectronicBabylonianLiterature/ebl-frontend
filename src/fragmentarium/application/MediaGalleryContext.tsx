import { createContext } from 'react'
import type MediaRepository from 'fragmentarium/application/MediaRepository'
import type MediaBinaryLoader from 'fragmentarium/application/MediaBinaryLoader'
import type MediaManagementRepository from 'fragmentarium/application/MediaManagementRepository'

export interface MediaGalleryServices {
  readonly sessionKey?: string
  readonly repository: MediaRepository
  readonly binaryLoader: MediaBinaryLoader
  readonly management?: MediaManagementRepository
  readonly canUpload?: boolean
  readonly canManage?: boolean
  readonly currentUserId?: string
}

export const MediaGalleryContext = createContext<MediaGalleryServices | null>(
  null,
)
