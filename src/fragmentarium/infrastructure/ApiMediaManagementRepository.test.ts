import ApiMediaManagementRepository from 'fragmentarium/infrastructure/ApiMediaManagementRepository'
import {
  api,
  changed,
  metadata,
  repository,
  resetMediaRepository,
} from 'fragmentarium/infrastructure/mediaManagementRepository.testSupport'
import { mediaFixture } from 'fragmentarium/ui/images/gallery.testSupport'
import { ApiError } from 'http/ApiError'

beforeEach(resetMediaRepository)

test('uploads one original with encoded metadata, retry identity and truthful progress callbacks', async () => {
  const file = new File(['jpeg'], 'tablet.jpg', { type: 'image/jpeg' })
  const media = {
    ...mediaFixture(),
    publicationStatus: 'PENDING_REVIEW',
    uploaderId: 'auth0|researcher',
  }
  api.uploadBinary.mockResolvedValue({ media: [media] })
  const onProgress = jest.fn()
  await expect(
    repository.upload('K.1/2', file, metadata, 'retry-key', { onProgress }),
  ).resolves.toEqual(media)
  expect(api.uploadBinary).toHaveBeenCalledWith(
    '/media?fragment=K.1%2F2',
    file,
    {
      'Content-Type': 'image/jpeg',
      'Idempotency-Key': 'retry-key',
      'X-Media-Metadata': encodeURIComponent(
        JSON.stringify({ ...metadata, originalFilename: file.name }),
      ),
    },
    expect.objectContaining({ signal: expect.any(AbortSignal), onProgress }),
  )
  expect(changed).toHaveBeenCalledWith('K.1/2')
})

test.each(['publish', 'reject'] as const)(
  '%s uses authenticated action contract and saved state',
  async (action) => {
    const media = mediaFixture()
    api.requestJson.mockResolvedValue({ media: [media] })
    await expect(
      repository[action]('K.1/2', media.id, 'Reviewed'),
    ).resolves.toEqual(media)
    expect(api.requestJson).toHaveBeenCalledWith(
      `/media/${media.id}/${action}?fragment=K.1%2F2`,
      'POST',
      { reason: 'Reviewed' },
      {
        signal: expect.any(AbortSignal),
        onDispatched: expect.any(Function),
        headers: {},
      },
    )
  },
)

test('metadata-only patch and primary actions select canonical target from fragment envelope', async () => {
  const media = mediaFixture()
  api.requestJson.mockResolvedValue({
    media: [{ ...media, id: 'other' }, media],
  })
  await expect(
    repository.update('K.1', media.id, { caption: 'Reverse' }),
  ).resolves.toEqual(media)
  await expect(repository.setPrimary('K.1', media.id)).resolves.toEqual(media)
  expect(api.requestJson).toHaveBeenNthCalledWith(
    1,
    `/media/${media.id}?fragment=K.1`,
    'PATCH',
    { caption: 'Reverse' },
    {
      signal: expect.any(AbortSignal),
      onDispatched: expect.any(Function),
      headers: {},
    },
  )
  expect(api.requestJson).toHaveBeenNthCalledWith(
    2,
    `/media/${media.id}/primary?fragment=K.1`,
    'POST',
    {},
    {
      signal: expect.any(AbortSignal),
      onDispatched: expect.any(Function),
      headers: {},
    },
  )
})

describe('optimistic concurrency', () => {
  const media = { ...mediaFixture(), revision: 4 }
  const headersOf = (call = 0) => api.requestJson.mock.calls[call][3].headers

  beforeEach(() => api.requestJson.mockResolvedValue({ media: [media] }))

  test.each(['publish', 'reject'] as const)(
    '%s sends the displayed revision as a quoted If-Match',
    async (action) => {
      await repository[action]('K.1', media.id, undefined, undefined, 4)
      expect(headersOf()).toEqual({ 'If-Match': '"4"' })
    },
  )

  test('edit, primary and removal send If-Match for a known revision, including 0', async () => {
    await repository.update('K.1', media.id, { caption: 'x' }, undefined, 0)
    await repository.setPrimary('K.1', media.id, undefined, 12)
    await repository.remove('K.1', media.id, undefined, 5)
    expect(api.requestJson.mock.calls.map((call) => call[3].headers)).toEqual([
      { 'If-Match': '"0"' },
      { 'If-Match': '"12"' },
      { 'If-Match': '"5"' },
    ])
  })

  test('every mutation omits If-Match when the revision is unknown', async () => {
    await repository.publish('K.1', media.id)
    await repository.reject('K.1', media.id, 'Reason')
    await repository.update('K.1', media.id, { caption: 'x' })
    await repository.setPrimary('K.1', media.id)
    await repository.remove('K.1', media.id)
    expect(api.requestJson.mock.calls.map((call) => call[3].headers)).toEqual([
      {},
      {},
      {},
      {},
      {},
    ])
  })

  test('the saved item carries the new revision', async () => {
    api.requestJson.mockResolvedValue({ media: [{ ...media, revision: 5 }] })
    await expect(
      repository.publish('K.1', media.id, undefined, undefined, 4),
    ).resolves.toMatchObject({ revision: 5 })
  })

  test.each([412, 428])(
    'a dispatched mutation refused with stale-revision HTTP %p invalidates once',
    async (status) => {
      const error = new ApiError('Precondition', {}, status)
      api.requestJson.mockImplementation(
        (_path, _method, _body, { onDispatched }) => {
          onDispatched()
          return Promise.reject(error)
        },
      )
      await expect(
        repository.publish('K.1', media.id, undefined, undefined, 4),
      ).rejects.toBe(error)
      expect(changed.mock.calls).toEqual([['K.1']])
    },
  )
})

test('removal invalidates only after success and errors preserve old gallery state', async () => {
  api.requestJson.mockRejectedValueOnce(new Error('Denied'))
  await expect(repository.remove('K.1', 'id')).rejects.toThrow('Denied')
  expect(changed).not.toHaveBeenCalled()
  api.requestJson.mockResolvedValueOnce(null)
  await expect(repository.remove('K.1', 'id')).resolves.toBeUndefined()
  expect(changed).toHaveBeenCalledTimes(1)
})

test('session disposal cancels requests and rejects late successful responses without invalidating another session', async () => {
  let resolve: (value: unknown) => void = () => undefined
  api.requestJson.mockReturnValue(
    new Promise((done) => {
      resolve = done
    }),
  )
  const pending = repository.publish('K.1', mediaFixture().id)
  const signal = api.requestJson.mock.calls[0][3].signal
  repository.dispose()
  expect(signal.aborted).toBe(true)
  resolve({ media: [mediaFixture()] })
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  expect(changed).not.toHaveBeenCalled()
})

test('cancels fragment request and never dispatches already cancelled upload', async () => {
  const controller = new AbortController()
  controller.abort()
  await expect(
    repository.upload('K.1', new File([''], 'a.png'), metadata, 'key', {
      signal: controller.signal,
    }),
  ).rejects.toMatchObject({ name: 'AbortError' })
  expect(api.uploadBinary).not.toHaveBeenCalled()
})

test('rejects unknown publication states and missing canonical mutation responses', async () => {
  api.requestJson.mockResolvedValue({
    media: [{ ...mediaFixture(), publicationStatus: 'FUTURE_STATE' }],
  })
  await expect(repository.publish('K.1', mediaFixture().id)).rejects.toThrow(
    'unsupported',
  )
  api.requestJson.mockResolvedValue({ media: [] })
  await expect(repository.publish('K.1', mediaFixture().id)).rejects.toThrow(
    'missing',
  )
  expect(changed).not.toHaveBeenCalled()
})

test('a repository without a change observer can complete a mutation', async () => {
  api.requestJson.mockResolvedValue(undefined)
  const unobserved = new ApiMediaManagementRepository(api)
  await expect(unobserved.remove('K.1', 'media-id')).resolves.toBeUndefined()
})

test('rejects an ambiguous upload response with multiple canonical images', async () => {
  api.uploadBinary.mockResolvedValue({
    media: [mediaFixture(), mediaFixture({ id: 'other' })],
  })
  await expect(
    repository.upload('K.1', new File(['image'], 'a.png'), metadata, 'key'),
  ).rejects.toThrow('missing')
  expect(changed).not.toHaveBeenCalled()
})
