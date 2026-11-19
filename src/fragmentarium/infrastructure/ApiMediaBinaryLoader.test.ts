import ApiMediaBinaryLoader from 'fragmentarium/infrastructure/ApiMediaBinaryLoader'
import { imageBlob, mediaId } from 'fragmentarium/ui/images/gallery.testSupport'
import type { MediaBinaryRepresentation } from 'fragmentarium/application/MediaBinaryLoader'

const fetchBlob = jest.fn()
const loader = new ApiMediaBinaryLoader({ fetchBlob })

beforeEach(() => fetchBlob.mockReset())

test.each<MediaBinaryRepresentation>([
  'original',
  'display',
  'small',
  'medium',
  'large',
])(
  'loads %s through authenticated API infrastructure using the current fragment',
  async (representation) => {
    fetchBlob.mockResolvedValue(imageBlob)
    const signal = new AbortController().signal
    await expect(
      loader.fetch(
        { fragmentNumber: 'K.1/2', mediaId, representation },
        signal,
      ),
    ).resolves.toBe(imageBlob)
    const suffix =
      representation === 'original'
        ? 'file'
        : representation === 'display'
          ? 'display'
          : `thumbnail/${representation}`
    expect(fetchBlob).toHaveBeenCalledWith(
      `/media/${mediaId}/${suffix}?fragment=K.1%2F2`,
      false,
      signal,
    )
  },
)

test.each(['image/svg+xml', 'text/html', 'application/octet-stream'])(
  'rejects %s previews',
  async (type) => {
    fetchBlob.mockResolvedValue(new Blob(['content'], { type }))
    await expect(
      loader.fetch({
        fragmentNumber: 'K.1',
        mediaId,
        representation: 'display',
      }),
    ).rejects.toThrow('unsupported format')
  },
)

test('allows SVG originals for download', async () => {
  const original = new Blob(['<svg/>'], { type: 'image/svg+xml' })
  fetchBlob.mockResolvedValue(original)
  await expect(
    loader.fetch({
      fragmentNumber: 'K.1',
      mediaId,
      representation: 'original',
    }),
  ).resolves.toBe(original)
})

test('rejects empty originals', async () => {
  fetchBlob.mockResolvedValue(new Blob([], { type: 'image/jpeg' }))
  await expect(
    loader.fetch({
      fragmentNumber: 'K.1',
      mediaId,
      representation: 'original',
    }),
  ).rejects.toThrow('empty')
})

test('does not start a request after cancellation', async () => {
  const controller = new AbortController()
  controller.abort()
  await expect(
    loader.fetch(
      { fragmentNumber: 'K.1', mediaId, representation: 'original' },
      controller.signal,
    ),
  ).rejects.toHaveProperty('name', 'AbortError')
  expect(fetchBlob).not.toHaveBeenCalled()
})
