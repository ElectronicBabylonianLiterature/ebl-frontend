import MediaBinaryLoader, {
  MediaBinaryRequest,
} from 'fragmentarium/application/MediaBinaryLoader'

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
})
