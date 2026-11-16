import { waitFor } from '@testing-library/react'
import ApiMediaManagementRepository from 'fragmentarium/infrastructure/ApiMediaManagementRepository'
import { createApiClientTestContext } from 'http/ApiClient.testSupport'
import {
  mediaMetadata,
  prepareUploadTransport,
  restoreUploadTransport,
  xhr,
} from 'http/uploadTransport.testSupport'

beforeEach(prepareUploadTransport)
afterEach(restoreUploadTransport)

test.each(['upload', 'update', 'publish', 'remove'] as const)(
  '%s cancelled during authentication sends no request and never invalidates',
  async (operation) => {
    const { apiClient, auth, errorReporter } = createApiClientTestContext()
    let resolveToken: (token: string) => void = () => undefined
    auth.getAccessToken.mockReturnValue(
      new Promise((resolve) => {
        resolveToken = resolve
      }),
    )
    const changed = jest.fn()
    const repository = new ApiMediaManagementRepository(apiClient, changed)
    const caller = new AbortController()
    const pending =
      operation === 'upload'
        ? repository.upload(
            'K.1',
            new File(['png'], 'a.png', { type: 'image/png' }),
            mediaMetadata,
            'key',
            { signal: caller.signal },
          )
        : operation === 'update'
          ? repository.update(
              'K.1',
              'id',
              { caption: 'Reverse' },
              caller.signal,
            )
          : operation === 'remove'
            ? repository.remove('K.1', 'id', caller.signal)
            : repository.publish('K.1', 'id', undefined, caller.signal)
    expect(auth.getAccessToken).toHaveBeenCalledTimes(1)
    caller.abort()
    resolveToken('test-token')
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    expect(window.XMLHttpRequest).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
    expect(changed).not.toHaveBeenCalled()
    expect(errorReporter.captureException).not.toHaveBeenCalled()
  },
)

test('an upload aborted after XHR dispatch invalidates once and preserves the AbortError', async () => {
  const { apiClient } = createApiClientTestContext()
  const changed = jest.fn()
  const repository = new ApiMediaManagementRepository(apiClient, changed)
  const caller = new AbortController()
  const pending = repository.upload(
    'K.1',
    new File(['png'], 'a.png', { type: 'image/png' }),
    mediaMetadata,
    'key',
    { signal: caller.signal },
  )
  await waitFor(() => expect(xhr.send).toHaveBeenCalledTimes(1))
  caller.abort()
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  expect(changed.mock.calls).toEqual([['K.1']])
})

test('a JSON mutation aborted after fetch dispatch invalidates once and preserves the AbortError', async () => {
  const { apiClient } = createApiClientTestContext()
  const changed = jest.fn()
  const repository = new ApiMediaManagementRepository(apiClient, changed)
  const caller = new AbortController()
  const error = new DOMException('Cancelled', 'AbortError')
  fetchMock.mockImplementationOnce(
    (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(error))
      }),
  )
  const pending = repository.publish('K.1', 'id', undefined, caller.signal)
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
  caller.abort()
  await expect(pending).rejects.toBe(error)
  expect(changed.mock.calls).toEqual([['K.1']])
})

test('cancellation during XHR setup never invalidates an unsent upload', async () => {
  const { apiClient } = createApiClientTestContext()
  const changed = jest.fn()
  const repository = new ApiMediaManagementRepository(apiClient, changed)
  const caller = new AbortController()
  xhr.open.mockImplementation(() => caller.abort())
  await expect(
    repository.upload(
      'K.1',
      new File(['png'], 'a.png', { type: 'image/png' }),
      mediaMetadata,
      'key',
      { signal: caller.signal },
    ),
  ).rejects.toMatchObject({ name: 'AbortError' })
  expect(xhr.send).not.toHaveBeenCalled()
  expect(changed).not.toHaveBeenCalled()
})

test('unknown transfer size reports bytes without an invented total and suppresses late cancelled callbacks', async () => {
  const { apiClient } = createApiClientTestContext()
  const controller = new AbortController()
  const onProgress = jest.fn()
  const onProcessing = jest.fn()
  const pending = apiClient.uploadBinary(
    '/media',
    new File(['file'], 'tablet.png'),
    {},
    { signal: controller.signal, onProgress, onProcessing },
  )
  await waitFor(() => expect(xhr.send).toHaveBeenCalled())
  xhr.upload.onprogress?.({ loaded: 2, lengthComputable: false })
  expect(onProgress).toHaveBeenCalledWith(2, undefined)
  controller.abort()
  xhr.upload.onprogress?.({ loaded: 4, total: 4, lengthComputable: true })
  xhr.upload.onload?.()
  expect(onProgress).toHaveBeenCalledTimes(1)
  expect(onProcessing).not.toHaveBeenCalled()
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
})
