import ApiMediaRepository from 'fragmentarium/infrastructure/ApiMediaRepository'
import { ApiError } from 'http/ApiClient'
import { mediaFixture } from 'fragmentarium/ui/images/gallery.testSupport'

const fetchJson = jest.fn()
const repository = new ApiMediaRepository({ fetchJson })

beforeEach(() => fetchJson.mockReset())

test('normalizes backend media DTOs with fragment query URLs', async () => {
  const media = mediaFixture()
  const signal = new AbortController().signal
  fetchJson.mockResolvedValue({ media: [media] })
  await expect(repository.findByFragment('K.1/2', signal)).resolves.toEqual([
    media,
  ])
  expect(fetchJson).toHaveBeenCalledWith(
    '/media?fragment=K.1%2F2',
    false,
    signal,
  )
})

test('supports empty media before migration', async () => {
  fetchJson.mockResolvedValue({ media: [] })
  await expect(repository.findByFragment('K.1')).resolves.toEqual([])
})

test('allows legacy fallback when the new endpoint is not deployed', async () => {
  fetchJson.mockRejectedValue(new ApiError('Not found', {}, 404))
  await expect(repository.findByFragment('K.1')).resolves.toEqual([])
})

test.each([401, 403, 500])(
  'never hides HTTP %s as an empty gallery',
  async (status) => {
    const error = new ApiError('Request failed', {}, status)
    fetchJson.mockRejectedValue(error)
    await expect(repository.findByFragment('K.1')).rejects.toBe(error)
  },
)

test.each([null, [], {}, { media: null }])(
  'rejects malformed response %p',
  async (response) => {
    fetchJson.mockResolvedValue(response)
    await expect(repository.findByFragment('K.1')).rejects.toThrow(
      'could not be read',
    )
  },
)

test.each([
  [mediaFixture(), { ...mediaFixture(), type: 'FUTURE_TYPE' }],
  [{ ...mediaFixture(), representations: {} }],
  [mediaFixture(), mediaFixture()],
])(
  'reports unsupported or duplicate media instead of dropping it',
  async (...media) => {
    fetchJson.mockResolvedValue({ media })
    await expect(repository.findByFragment('K.1')).rejects.toThrow(
      'unsupported images',
    )
  },
)

test('preserves cancellation', async () => {
  const error = new DOMException('cancelled', 'AbortError')
  fetchJson.mockRejectedValue(error)
  await expect(repository.findByFragment('K.1')).rejects.toBe(error)
})
