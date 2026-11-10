import ApiMediaManagementRepository from './ApiMediaManagementRepository'
import { mediaFixture } from 'fragmentarium/ui/images/gallery.testSupport'
import { MediaMetadata } from 'fragmentarium/application/MediaManagementRepository'
import { ApiError } from 'http/ApiError'

const metadata: MediaMetadata = {
  type: 'PHOTO',
  caption: 'Obverse',
  sourceInstitution: 'Museum',
  rightsStatement: 'Permission granted',
  permissionAttested: true,
}
const api = { requestJson: jest.fn(), uploadBinary: jest.fn() }
const changed = jest.fn()
let repository: ApiMediaManagementRepository

beforeEach(() => {
  jest.clearAllMocks()
  repository = new ApiMediaManagementRepository(api, changed)
})

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

describe('ambiguous cancellation of a dispatched request', () => {
  const file = new File(['png'], 'a.png', { type: 'image/png' })
  const abortable = () =>
    api.uploadBinary.mockImplementation((_url, _file, _headers, options) => {
      options.onDispatched()
      return new Promise((_resolve, reject) =>
        options.signal.addEventListener('abort', () =>
          reject(new DOMException('Upload cancelled', 'AbortError')),
        ),
      )
    })

  test('a caller abort after dispatch invalidates exactly that fragment once and rejects AbortError', async () => {
    abortable()
    const caller = new AbortController()
    const pending = repository.upload('K.1', file, metadata, 'key', {
      signal: caller.signal,
    })
    await Promise.resolve()
    expect(api.uploadBinary).toHaveBeenCalledTimes(1)
    caller.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    expect(changed).toHaveBeenCalledTimes(1)
    expect(changed).toHaveBeenCalledWith('K.1')
  })

  test('a response arriving after the abort reports once, never as success', async () => {
    let resolve: (value: unknown) => void = () => undefined
    api.requestJson.mockImplementation(
      (_path, _method, _body, { onDispatched }) => {
        onDispatched()
        return new Promise((done) => {
          resolve = done
        })
      },
    )
    const caller = new AbortController()
    const pending = repository.publish(
      'K.1',
      mediaFixture().id,
      undefined,
      caller.signal,
    )
    caller.abort()
    resolve({ media: [mediaFixture()] })
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    expect(changed).toHaveBeenCalledTimes(1)
  })

  test('disposed sessions and cancelled-before-dispatch requests never report', async () => {
    abortable()
    const pending = repository.upload('K.1', file, metadata, 'key')
    repository.dispose()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    const caller = new AbortController()
    caller.abort()
    repository.activate()
    await expect(
      repository.upload('K.1', file, metadata, 'key', {
        signal: caller.signal,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' })
    expect(changed).not.toHaveBeenCalled()
  })

  test('failures before dispatch do not invalidate caches', async () => {
    api.uploadBinary.mockRejectedValue(new Error('Denied'))
    await expect(
      repository.upload('K.1', file, metadata, 'key'),
    ).rejects.toThrow('Denied')
    expect(changed).not.toHaveBeenCalled()
  })

  const dispatchedFailure = (outcome: () => Promise<unknown>) =>
    api.requestJson.mockImplementation(
      (_path, _method, _body, { onDispatched }) => {
        onDispatched()
        return outcome()
      },
    )

  test.each([400, 403, 404, 413, 422])(
    'a dispatched mutation definitively rejected with HTTP %p does not invalidate',
    async (status) => {
      const error = new ApiError('Rejected', {}, status)
      dispatchedFailure(() => Promise.reject(error))
      await expect(repository.publish('K.1', mediaFixture().id)).rejects.toBe(
        error,
      )
      expect(changed).not.toHaveBeenCalled()
    },
  )

  test.each([
    ['a network failure (status 0)', new ApiError('Network', {}, 0)],
    ['a gateway timeout', new ApiError('Gateway Timeout', {}, 504)],
    ['a bad gateway', new ApiError('Bad Gateway', {}, 502)],
    ['a server error', new ApiError('Server error', {}, 500)],
    [
      'an idempotency conflict (409)',
      new ApiError('This upload is already being processed.', {}, 409),
    ],
    ['an error without a status', new TypeError('Failed to fetch')],
  ])(
    'a dispatched mutation failing with %s invalidates once and surfaces the error',
    async (_name, error) => {
      dispatchedFailure(() => Promise.reject(error))
      await expect(repository.publish('K.1', mediaFixture().id)).rejects.toBe(
        error,
      )
      expect(changed.mock.calls).toEqual([['K.1']])
    },
  )

  test('an unreadable success body after dispatch invalidates once', async () => {
    dispatchedFailure(() => Promise.resolve({ unexpected: true }))
    await expect(repository.publish('K.1', mediaFixture().id)).rejects.toThrow(
      'could not be read',
    )
    expect(changed.mock.calls).toEqual([['K.1']])
  })

  test('an uncertain upload failure after dispatch invalidates once', async () => {
    const error = new ApiError('Upload connection failed', {}, 0)
    api.uploadBinary.mockImplementation((_url, _file, _headers, options) => {
      options.onDispatched()
      return Promise.reject(error)
    })
    await expect(repository.upload('K.1', file, metadata, 'key')).rejects.toBe(
      error,
    )
    expect(changed.mock.calls).toEqual([['K.1']])
  })

  test('an uncertain failure of a request from a disposed session never invalidates', async () => {
    let fail: (error: Error) => void = () => undefined
    dispatchedFailure(
      () =>
        new Promise((_resolve, reject) => {
          fail = reject
        }),
    )
    const pending = repository.publish('K.1', mediaFixture().id)
    repository.dispose()
    repository.activate()
    fail(new ApiError('Bad Gateway', {}, 502))
    await expect(pending).rejects.toMatchObject({ status: 502 })
    expect(changed).not.toHaveBeenCalled()
  })

  test('dispose then activate before an abort rejection settles never revives the old request', async () => {
    abortable()
    const pending = repository.upload('K.1', file, metadata, 'old-key')
    repository.dispose()
    repository.activate()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    expect(changed).not.toHaveBeenCalled()

    const media = mediaFixture()
    api.uploadBinary.mockResolvedValueOnce({ media: [media] })
    await expect(
      repository.upload('K.2', file, metadata, 'new-key'),
    ).resolves.toEqual(media)
    expect(changed.mock.calls).toEqual([['K.2']])
  })

  test('dispose then activate fences a late successful response too', async () => {
    let resolve: (value: unknown) => void = () => undefined
    api.requestJson.mockImplementation(
      (_path, _method, _body, { onDispatched }) => {
        onDispatched()
        return new Promise((done) => {
          resolve = done
        })
      },
    )
    const pending = repository.publish('K.1', mediaFixture().id)
    repository.dispose()
    repository.activate()
    resolve({ media: [mediaFixture()] })
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    expect(changed).not.toHaveBeenCalled()
  })

  test('simultaneous dispatched aborts invalidate each active fragment exactly once', async () => {
    abortable()
    const first = new AbortController()
    const second = new AbortController()
    const pending = repository.upload('K.1', file, metadata, 'first', {
      signal: first.signal,
    })
    const other = repository.upload('K.2', file, metadata, 'second', {
      signal: second.signal,
    })
    first.abort()
    second.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    await expect(other).rejects.toMatchObject({ name: 'AbortError' })
    expect(changed.mock.calls).toEqual([['K.1'], ['K.2']])
  })
})
