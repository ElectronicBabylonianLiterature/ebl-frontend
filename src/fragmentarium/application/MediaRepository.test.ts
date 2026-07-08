import MediaRepository from './MediaRepository'

describe('MediaRepository contract', () => {
  test('supports a fake metadata repository implementation', async () => {
    const mediaRepository: MediaRepository = {
      findByFragment: async (fragmentNumber) => [
        {
          id: `${fragmentNumber}-media`,
          type: 'PHOTO',
          sortOrder: 0,
          isPrimary: true,
          references: [],
          representations: {
            original: {
              url: `/fragments/${fragmentNumber}/media/file`,
              mimeType: 'image/jpeg',
            },
            thumbnails: {},
          },
        },
      ],
    }

    await expect(mediaRepository.findByFragment('K.1')).resolves.toEqual([
      {
        id: 'K.1-media',
        type: 'PHOTO',
        sortOrder: 0,
        isPrimary: true,
        references: [],
        representations: {
          original: {
            url: '/fragments/K.1/media/file',
            mimeType: 'image/jpeg',
          },
          thumbnails: {},
        },
      },
    ])
  })
})
