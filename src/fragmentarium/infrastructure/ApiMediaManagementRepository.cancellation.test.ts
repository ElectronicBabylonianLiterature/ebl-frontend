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
