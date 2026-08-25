import MediaBinaryLoader, {
  MediaBinaryRepresentation,
  MediaBinaryRequest,
} from 'fragmentarium/application/MediaBinaryLoader'
import { ThumbnailSizes } from 'fragmentarium/domain/media'
import { fragmentMediaBinaryUrl } from 'fragmentarium/infrastructure/mediaUrls'

const representations: readonly MediaBinaryRepresentation[] = [
  'original',
  'display',
  ...ThumbnailSizes,
]

const request: MediaBinaryRequest = {
  fragmentNumber: 'K.1',
  mediaId: 'media-id',
  representation: 'original',
}

function createLoader(
  record: (url: string, signal?: AbortSignal) => void,
): MediaBinaryLoader {
  return {
    fetch: async (binaryRequest, signal) => {
      const url = fragmentMediaBinaryUrl(binaryRequest)
      record(url, signal)
      return new Blob([], { type: 'image/jpeg' })
    },
  }
}

describe('MediaBinaryLoader contract', () => {
  test('carries enough identity to address a fragment-scoped route', async () => {
    const requested: string[] = []
    await createLoader((url) => requested.push(url)).fetch(request)

    expect(requested).toEqual(['/fragments/K.1/media/media-id/file'])
  })

  test.each(representations)(
    'addresses a distinct route for the %s representation',
    async (representation) => {
      const requested: string[] = []
      await createLoader((url) => requested.push(url)).fetch({
        ...request,
        representation,
      })

      expect(requested[0]).toContain('/fragments/K.1/media/media-id/')
    },
  )

  test('never addresses another fragment', async () => {
    const requested: string[] = []
    const loader = createLoader((url) => requested.push(url))

    await loader.fetch({ ...request, fragmentNumber: 'K.1' })
    await loader.fetch({ ...request, fragmentNumber: 'BM.2' })

    expect(requested).toEqual([
      '/fragments/K.1/media/media-id/file',
      '/fragments/BM.2/media/media-id/file',
    ])
  })

  test('forwards an optional AbortSignal to the implementation', async () => {
    const controller = new AbortController()
    let receivedSignal: AbortSignal | undefined
    const loader = createLoader((_url, signal) => {
      receivedSignal = signal
    })

    await loader.fetch(request, controller.signal)

    expect(receivedSignal).toBe(controller.signal)
  })

  test('supports fetching without a signal', async () => {
    let receivedSignal: AbortSignal | undefined = new AbortController().signal
    const loader = createLoader((_url, signal) => {
      receivedSignal = signal
    })

    await loader.fetch(request)

    expect(receivedSignal).toBeUndefined()
  })
})
