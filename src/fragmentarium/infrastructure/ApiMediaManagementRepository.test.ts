import ApiMediaManagementRepository from './ApiMediaManagementRepository'
import { mediaFixture } from 'fragmentarium/ui/images/gallery.testSupport'
import { MediaMetadata } from 'fragmentarium/application/MediaManagementRepository'

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
      expect.any(AbortSignal),
      expect.any(Function),
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
    expect.any(AbortSignal),
    expect.any(Function),
  )
  expect(api.requestJson).toHaveBeenNthCalledWith(
    2,
    `/media/${media.id}/primary?fragment=K.1`,
    'POST',
    {},
    expect.any(AbortSignal),
    expect.any(Function),
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
  const signal = api.requestJson.mock.calls[0][3]
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
      (_path, _method, _body, _signal, onDispatched) => {
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

  test('ordinary failures do not invalidate caches', async () => {
    api.uploadBinary.mockRejectedValue(new Error('Denied'))
    await expect(
      repository.upload('K.1', file, metadata, 'key'),
    ).rejects.toThrow('Denied')
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
      (_path, _method, _body, _signal, onDispatched) => {
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
