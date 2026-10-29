import type { MediaResource } from 'fragmentarium/domain/media'
import type { MediaGalleryServices } from 'fragmentarium/application/MediaGalleryContext'
import {
  fragmentMediaOriginalUrl,
  fragmentMediaDisplayUrl,
  fragmentMediaThumbnailUrl,
} from 'fragmentarium/infrastructure/mediaUrls'

export const mediaId = '550e8400-e29b-41d4-a716-446655440000'
export const imageBlob = new Blob(['image'], { type: 'image/jpeg' })

export function mediaFixture(
  overrides: Partial<MediaResource> = {},
): MediaResource {
  const id = overrides.id ?? mediaId
  return {
    id,
    type: 'PHOTO',
    sortOrder: 0,
    isPrimary: false,
    references: [],
    representations: {
      original: {
        url: fragmentMediaOriginalUrl('K.1', id),
        mimeType: 'image/jpeg',
      },
      display: {
        url: fragmentMediaDisplayUrl('K.1', id),
        mimeType: 'image/jpeg',
      },
      thumbnails: {
        small: {
          url: fragmentMediaThumbnailUrl('K.1', id, 'small'),
          mimeType: 'image/jpeg',
        },
      },
    },
    ...overrides,
  }
}

export function galleryServices(
  media: readonly MediaResource[] = [mediaFixture()],
): MediaGalleryServices & {
  repository: { findByFragment: jest.Mock }
  binaryLoader: { fetch: jest.Mock }
} {
  return {
    repository: { findByFragment: jest.fn().mockResolvedValue(media) },
    binaryLoader: { fetch: jest.fn().mockResolvedValue(imageBlob) },
  }
}
