import { normalizeMediaResource } from './mediaMapper'

describe('media mapper DTO boundaries', () => {
  test('drops backend-only fields from normalized media resources', () => {
    const mediaResource = normalizeMediaResource({
      id: 'media-id',
      type: 'PHOTO',
      sortOrder: 0,
      isPrimary: true,
      projects: ['project-a'],
      fileName: 'original.jpg',
      checksum: 'checksum',
      representations: {
        original: {
          url: '/media/file',
          mimeType: 'image/jpeg',
        },
      },
    })

    expect(mediaResource).toEqual({
      id: 'media-id',
      type: 'PHOTO',
      sortOrder: 0,
      isPrimary: true,
      references: [],
      representations: {
        original: {
          url: '/media/file',
          mimeType: 'image/jpeg',
        },
        thumbnails: {},
      },
    })
    expect(mediaResource).not.toHaveProperty('projects')
    expect(mediaResource).not.toHaveProperty('fileName')
    expect(mediaResource).not.toHaveProperty('checksum')
  })
})
