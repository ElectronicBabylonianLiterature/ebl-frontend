import type { MediaResource } from 'fragmentarium/domain/media'

export function createMediaResource(
  overrides: Partial<MediaResource>,
  id: string,
): MediaResource {
  return {
    id,
    type: 'PHOTO',
    sortOrder: 0,
    isPrimary: false,
    references: [],
    representations: {
      original: {
        url: `/media/${id}`,
        mimeType: 'image/jpeg',
      },
      thumbnails: {},
    },
    ...overrides,
  }
}
