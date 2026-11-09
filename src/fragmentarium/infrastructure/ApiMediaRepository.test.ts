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

test('keeps published gallery readable when the backend write flag is disabled', async () => {
  const media = mediaFixture({ publicationStatus: 'PUBLISHED' })
  const signal = new AbortController().signal
  const managementRepository = new ApiMediaRepository({ fetchJson }, true)
  fetchJson
    .mockRejectedValueOnce(new ApiError('Writes disabled', {}, 404))
    .mockResolvedValueOnce({ media: [media] })
  await expect(
    managementRepository.findByFragment('K.1/2', signal),
  ).resolves.toEqual([media])
  expect(fetchJson).toHaveBeenNthCalledWith(
    1,
    '/media?fragment=K.1%2F2&view=management',
    true,
    signal,
  )
  expect(fetchJson).toHaveBeenNthCalledWith(
    2,
    '/media?fragment=K.1%2F2',
    false,
    signal,
  )
})

test('management authorization failures never silently retry the ordinary view', async () => {
  const managementRepository = new ApiMediaRepository({ fetchJson }, true)
  const error = new ApiError('Not authorized', {}, 403)
  fetchJson.mockRejectedValue(error)
  await expect(managementRepository.findByFragment('K.1')).rejects.toBe(error)
  expect(fetchJson).toHaveBeenCalledTimes(1)
})

test.each([['PUBLISHED'], ['PENDING_REVIEW'], ['REJECTED']])(
  'rejects publication status arrays instead of coercing them into known states: %p',
  async (...publicationStatus) => {
    fetchJson.mockResolvedValue({
      media: [{ ...mediaFixture(), publicationStatus }],
    })
    await expect(repository.findByFragment('K.1')).rejects.toThrow(
      'unsupported images',
    )
  },
)

test('legacy rights annotations expose only the marked rights fields and preserve historical publication semantics', async () => {
  const media = mediaFixture()
  const rights = {
    creator: 'Photographer',
    sourceInstitution: 'Museum',
    copyrightHolder: 'Trustees',
    rightsStatement: 'Reproduction allowed',
    description: 'Archive note',
  }
  fetchJson.mockResolvedValue({
    media: [
      {
        ...media,
        ...rights,
        rightsAnnotated: true,
        uploaderId: 'private-uploader',
        uploadedAt: 'private-time',
        reviewerId: 'private-reviewer',
        reviewedAt: 'private-review-time',
        reviewReason: 'private-review',
        permissionAttested: true,
        originalFilename: 'private-original.png',
        projects: ['CAIC'],
        importSource: { fileId: 'private-file' },
      },
    ],
  })
  await expect(repository.findByFragment('K.1')).resolves.toEqual([
    { ...media, rightsAnnotated: true, ...rights },
  ])
})

test.each([undefined, false, 'true', 1, []].map((marker) => ({ marker })))(
  'unmarked legacy backend-only fields remain excluded for rights marker %p',
  async ({ marker }) => {
    const media = mediaFixture()
    fetchJson.mockResolvedValue({
      media: [
        {
          ...media,
          rightsAnnotated: marker,
          creator: 'Unmarked creator',
          sourceInstitution: 'Unmarked source',
          copyrightHolder: 'Unmarked owner',
          rightsStatement: 'Unmarked rights',
          description: 'Unmarked note',
          uploaderId: 'private-uploader',
          permissionAttested: true,
          reviewerId: 'private-reviewer',
          projects: ['AMPS'],
          importSource: { fileId: 'private-file' },
        },
      ],
    })
    await expect(repository.findByFragment('K.1')).resolves.toEqual([media])
  },
)

test('marked legacy annotation drops malformed rights fields and never overrides an invalid publication state', async () => {
  const media = mediaFixture()
  fetchJson.mockResolvedValueOnce({
    media: [
      {
        ...media,
        rightsAnnotated: true,
        creator: ['not text'],
        rightsStatement: false,
        copyrightHolder: {},
        description: 4,
      },
    ],
  })
  await expect(repository.findByFragment('K.1')).resolves.toEqual([
    { ...media, rightsAnnotated: true },
  ])
  fetchJson.mockResolvedValueOnce({
    media: [{ ...media, rightsAnnotated: true, publicationStatus: 'UNKNOWN' }],
  })
  await expect(repository.findByFragment('K.1')).rejects.toThrow(
    'unsupported images',
  )
})

test.each([true, false])(
  'preserves the canonical gallery legacy-fallback decision %p independently of the array compatibility method',
  async (legacyFallbackAllowed) => {
    const media = mediaFixture()
    fetchJson.mockResolvedValue({ media: [media], legacyFallbackAllowed })
    await expect(repository.findGallery('K.1')).resolves.toEqual({
      media: [media],
      legacyFallbackAllowed,
    })
    await expect(repository.findByFragment('K.1')).resolves.toEqual([media])
  },
)

test.each(['false', null, 0, [], {}])(
  'rejects malformed legacy visibility decisions %p rather than treating them as permission',
  async (legacyFallbackAllowed) => {
    fetchJson.mockResolvedValue({ media: [], legacyFallbackAllowed })
    await expect(repository.findGallery('K.1')).rejects.toThrow(
      'legacy media visibility response',
    )
  },
)

test('management-disabled fallback retains the published response visibility decision', async () => {
  const media = mediaFixture()
  const management = new ApiMediaRepository({ fetchJson }, true)
  fetchJson
    .mockRejectedValueOnce(new ApiError('Writes disabled', {}, 404))
    .mockResolvedValueOnce({ media: [media], legacyFallbackAllowed: false })
  await expect(management.findGallery('K.1')).resolves.toEqual({
    media: [media],
    legacyFallbackAllowed: false,
  })
})

test('undeployed read gallery leaves historical fallback compatibility intact', async () => {
  fetchJson.mockRejectedValue(new ApiError('Not found', {}, 404))
  await expect(repository.findGallery('K.1')).resolves.toEqual({ media: [] })
})
