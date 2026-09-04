import MediaRepository from 'fragmentarium/application/MediaRepository'
import { normalizeFragmentMediaResponse } from 'fragmentarium/infrastructure/mediaMapper'
import { fragmentMediaOriginalUrl } from 'fragmentarium/infrastructure/mediaUrls'

const media = normalizeFragmentMediaResponse({
  media: [
    {
      id: 'photo-id',
      type: 'PHOTO',
      sortOrder: 0,
      isPrimary: true,
      references: [],
      representations: {
        original: {
          url: fragmentMediaOriginalUrl('K.1', 'photo-id'),
          mimeType: 'image/jpeg',
        },
        thumbnails: {},
      },
    },
    {
      id: 'copy-id',
      type: 'COPY',
      sortOrder: 1,
      isPrimary: false,
      references: [],
      representations: {
        original: {
          url: fragmentMediaOriginalUrl('K.1', 'copy-id'),
          mimeType: 'image/svg+xml',
        },
        thumbnails: {},
      },
    },
  ],
}).media

function createRepository(
  record: (fragmentNumber: string, signal?: AbortSignal) => void,
): MediaRepository {
  return {
    findByFragment: async (fragmentNumber, signal) => {
      record(fragmentNumber, signal)
      return media
    },
  }
}

describe('MediaRepository contract', () => {
  test('returns every representation of every fragment media in one call', async () => {
    const calls: string[] = []
    const found = await createRepository((fragmentNumber) =>
      calls.push(fragmentNumber),
    ).findByFragment('K.1')

    expect(calls).toEqual(['K.1'])
    expect(found).toHaveLength(2)
    expect(
      found.map((resource) => resource.representations.original.url),
    ).toEqual([
      fragmentMediaOriginalUrl('K.1', 'photo-id'),
      fragmentMediaOriginalUrl('K.1', 'copy-id'),
    ])
  })

  test('requires fragment context for every lookup', async () => {
    const calls: string[] = []
    const repository = createRepository((fragmentNumber) =>
      calls.push(fragmentNumber),
    )

    await repository.findByFragment('K.1')
    await repository.findByFragment('BM.2')

    expect(calls).toEqual(['K.1', 'BM.2'])
  })

  test('forwards an optional AbortSignal to the implementation', async () => {
    const controller = new AbortController()
    let receivedSignal: AbortSignal | undefined
    const repository = createRepository((_fragmentNumber, signal) => {
      receivedSignal = signal
    })

    await repository.findByFragment('K.1', controller.signal)

    expect(receivedSignal).toBe(controller.signal)
  })
})
