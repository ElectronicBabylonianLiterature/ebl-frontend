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

  test('forwards an optional AbortSignal to the implementation', async () => {
    const controller = new AbortController()
    let receivedSignal: AbortSignal | undefined
    const mediaRepository: MediaRepository = {
      findByFragment: async (fragmentNumber, signal) => {
        receivedSignal = signal
        return []
      },
    }

    await mediaRepository.findByFragment('K.1', controller.signal)

    expect(receivedSignal).toBe(controller.signal)
  })

  test('supports calling without a signal', async () => {
    const mediaRepository: MediaRepository = {
      findByFragment: async (fragmentNumber, signal) => {
        expect(signal).toBeUndefined()
        return []
      },
    }

    await expect(mediaRepository.findByFragment('K.1')).resolves.toEqual([])
  })
})
