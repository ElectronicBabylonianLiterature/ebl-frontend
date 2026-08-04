import MediaBinaryLoader, { MediaBinaryRequest } from './MediaBinaryLoader'

describe('MediaBinaryLoader contract', () => {
  test('supports a fake implementation for future authenticated loading', async () => {
    const request: MediaBinaryRequest = {
      mediaId: 'media-id',
      url: '/fragments/K.1/media/media-id/file',
      representation: 'original',
    }

    const mediaBinaryLoader: MediaBinaryLoader = {
      fetch: async ({ url }) => new Blob([url], { type: 'image/jpeg' }),
    }

    await expect(mediaBinaryLoader.fetch(request)).resolves.toBeInstanceOf(Blob)
  })

  test('forwards an optional AbortSignal to the implementation', async () => {
    const request: MediaBinaryRequest = {
      mediaId: 'media-id',
      url: '/fragments/K.1/media/media-id/file',
      representation: 'original',
    }
    const controller = new AbortController()
    let receivedSignal: AbortSignal | undefined
    const mediaBinaryLoader: MediaBinaryLoader = {
      fetch: async ({ url }, signal) => {
        receivedSignal = signal
        return new Blob([url], { type: 'image/jpeg' })
      },
    }

    await mediaBinaryLoader.fetch(request, controller.signal)

    expect(receivedSignal).toBe(controller.signal)
  })

  test('supports fetching without a signal', async () => {
    const request: MediaBinaryRequest = {
      mediaId: 'media-id',
      url: '/fragments/K.1/media/media-id/file',
      representation: 'original',
    }
    const mediaBinaryLoader: MediaBinaryLoader = {
      fetch: async ({ url }, signal) => {
        expect(signal).toBeUndefined()
        return new Blob([url], { type: 'image/jpeg' })
      },
    }

    await expect(mediaBinaryLoader.fetch(request)).resolves.toBeInstanceOf(Blob)
  })
})
