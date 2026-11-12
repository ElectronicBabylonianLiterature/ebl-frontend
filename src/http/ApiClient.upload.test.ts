import { createApiClientTestContext } from './ApiClient.testSupport'
import { waitFor } from '@testing-library/react'
import ApiMediaManagementRepository from 'fragmentarium/infrastructure/ApiMediaManagementRepository'

let xhr: {
  open: jest.Mock
  setRequestHeader: jest.Mock
  send: jest.Mock
  abort: jest.Mock
  upload: {
    onprogress?: (event: Partial<ProgressEvent>) => void
    onload?: () => void
  }
  onload?: () => void
  onabort?: () => void
  onerror?: () => void
  status: number
  statusText: string
  responseText: string
}
let originalXHR: typeof XMLHttpRequest

beforeEach(() => {
  originalXHR = window.XMLHttpRequest
  xhr = {
    open: jest.fn(),
    setRequestHeader: jest.fn(),
    send: jest.fn(),
    abort: jest.fn(() => xhr.onabort?.()),
    upload: {},
    status: 201,
    statusText: 'Created',
    responseText: '{"media":[]}',
  }
  window.XMLHttpRequest = jest.fn(() => xhr) as unknown as typeof XMLHttpRequest
})
afterEach(() => {
  window.XMLHttpRequest = originalXHR
})

test('uses authenticated binary transport and reports only actual upload progress followed by processing', async () => {
  const { apiClient } = createApiClientTestContext()
  const onProgress = jest.fn()
  const onProcessing = jest.fn()
  const file = new File(['file'], 'tablet.png', { type: 'image/png' })
  const pending = apiClient.uploadBinary(
    '/media?fragment=K.1',
    file,
    { 'Content-Type': file.type },
    { onProgress, onProcessing },
  )
  await waitFor(() => expect(xhr.send).toHaveBeenCalled())
  expect(xhr.setRequestHeader).toHaveBeenCalledWith(
    'authorization',
    'Bearer test-token',
  )
  expect(xhr.send).toHaveBeenCalledWith(file)
  xhr.upload.onprogress?.({ loaded: 2, total: 4, lengthComputable: true })
  expect(onProgress).toHaveBeenCalledWith(2, 4)
  expect(onProcessing).not.toHaveBeenCalled()
  xhr.upload.onload?.()
  expect(onProcessing).toHaveBeenCalledTimes(1)
  xhr.onload?.()
  await expect(pending).resolves.toEqual({ media: [] })
})

test('cancels active transport with AbortError', async () => {
  const { apiClient } = createApiClientTestContext()
  const controller = new AbortController()
  const pending = apiClient.uploadBinary(
    '/media',
    new File(['file'], 'tablet.png'),
    {},
    { signal: controller.signal },
  )
  await waitFor(() => expect(xhr.send).toHaveBeenCalled())
  controller.abort()
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  expect(xhr.abort).toHaveBeenCalledTimes(1)
})

test('parses API errors without turning them into successful uploads', async () => {
  const { apiClient } = createApiClientTestContext()
  const pending = apiClient.uploadBinary(
    '/media',
    new File(['file'], 'tablet.png'),
    {},
  )
  await waitFor(() => expect(xhr.send).toHaveBeenCalled())
  xhr.status = 403
  xhr.responseText = '{"description":"Insufficient permission"}'
  xhr.onload?.()
  await expect(pending).rejects.toMatchObject({
    status: 403,
    message: 'Insufficient permission',
  })
})

test('JSON management mutations preserve method, body, cancellation and 204 response semantics', async () => {
  const { apiClient } = createApiClientTestContext()
  const controller = new AbortController()
  fetchMock.mockResponseOnce('', { status: 204 })
  await expect(
    apiClient.requestJson('/media/id?fragment=K.1', 'DELETE', undefined, {
      signal: controller.signal,
    }),
  ).resolves.toBeNull()
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/media/id?fragment=K.1'),
    expect.objectContaining({ method: 'DELETE', signal: controller.signal }),
  )
})

test('JSON management mutations forward extra request headers without overriding the JSON content type', async () => {
  const { apiClient } = createApiClientTestContext()
  fetchMock.mockResponseOnce('', { status: 204 })
  await apiClient.requestJson(
    '/media/id/publish?fragment=K.1',
    'POST',
    {},
    { headers: { 'If-Match': '"3"', 'Content-Type': 'text/plain' } },
  )
  const headers = fetchMock.mock.calls[0][1]?.headers as Headers
  expect(headers.get('If-Match')).toBe('"3"')
  expect(headers.get('Content-Type')).toBe('application/json; charset=utf-8')
})

test('already cancelled requests never create or send a transport', async () => {
  const { apiClient } = createApiClientTestContext()
  const controller = new AbortController()
  controller.abort()
  await expect(
    apiClient.uploadBinary(
      '/media',
      new File(['file'], 'tablet.png'),
      {},
      { signal: controller.signal },
    ),
  ).rejects.toMatchObject({ name: 'AbortError' })
  expect(window.XMLHttpRequest).not.toHaveBeenCalled()
})

test('cancellation racing transport setup never sends the original', async () => {
  const { apiClient } = createApiClientTestContext()
  const controller = new AbortController()
  xhr.open.mockImplementation(() => controller.abort())
  await expect(
    apiClient.uploadBinary(
      '/media',
      new File(['file'], 'tablet.png'),
      {},
      { signal: controller.signal },
    ),
  ).rejects.toMatchObject({ name: 'AbortError' })
  expect(xhr.send).not.toHaveBeenCalled()
})

const mediaMetadata = {
  type: 'PHOTO' as const,
  caption: 'Obverse',
  sourceInstitution: '',
  rightsStatement: 'Permission',
  permissionAttested: true,
}

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

test('network upload failure reports a structured API error', async () => {
  const { apiClient, errorReporter } = createApiClientTestContext()
  const pending = apiClient.uploadBinary(
    '/media',
    new File(['file'], 'tablet.png'),
    {},
  )
  await waitFor(() => expect(xhr.send).toHaveBeenCalled())
  xhr.onerror?.()
  await expect(pending).rejects.toMatchObject({
    status: 0,
    message: 'Upload connection failed',
  })
  expect(errorReporter.captureException).toHaveBeenCalledWith(
    expect.any(Error),
    expect.objectContaining({ endpoint: '/media', method: 'POST', status: 0 }),
  )
})

test('malformed upload response remains a failure and successful empty bodies are represented as null', async () => {
  const { apiClient } = createApiClientTestContext()
  const pending = apiClient.uploadBinary(
    '/media',
    new File(['file'], 'tablet.png'),
    {},
  )
  await waitFor(() => expect(xhr.send).toHaveBeenCalled())
  xhr.responseText = 'not JSON'
  xhr.onload?.()
  await expect(pending).rejects.toMatchObject({
    message: 'The upload response could not be read.',
  })
  xhr.send.mockClear()
  const next = apiClient.uploadBinary(
    '/media',
    new File(['file'], 'tablet.png'),
    {},
  )
  await waitFor(() => expect(xhr.send).toHaveBeenCalled())
  xhr.responseText = ''
  xhr.onload?.()
  await expect(next).resolves.toBeNull()
})

test.each([
  [{ title: 'Upload unavailable' }, 'Upload unavailable'],
  [
    { description: { reason: 'Quota reached' } },
    'Created: {"reason":"Quota reached"}',
  ],
  ['Unavailable', 'Created'],
])('handles bounded server error response shape %p', async (body, message) => {
  const { apiClient } = createApiClientTestContext()
  const pending = apiClient.uploadBinary(
    '/media',
    new File(['file'], 'tablet.png'),
    {},
  )
  await waitFor(() => expect(xhr.send).toHaveBeenCalled())
  xhr.status = 503
  xhr.responseText = JSON.stringify(body)
  xhr.onload?.()
  await expect(pending).rejects.toMatchObject({ status: 503, message })
})

test.each([
  [413, 'Request Entity Too Large', 'The file is too large to upload.'],
  [502, 'Bad Gateway', 'Bad Gateway'],
  [504, '', 'HTTP 504'],
  [500, '', 'HTTP 500'],
])(
  'non-JSON proxy error pages report HTTP %p instead of an unreadable response',
  async (status, statusText, message) => {
    const { apiClient } = createApiClientTestContext()
    const pending = apiClient.uploadBinary(
      '/media',
      new File(['file'], 'tablet.png'),
      {},
    )
    await waitFor(() => expect(xhr.send).toHaveBeenCalled())
    xhr.status = status
    xhr.statusText = statusText
    xhr.responseText =
      status === 500 ? '' : '<html><body>nginx error</body></html>'
    xhr.onload?.()
    await expect(pending).rejects.toMatchObject({ status, message, data: {} })
  },
)

test.each([false, true])(
  'transport exceptions respect existing capture state %p',
  async (alreadyCaptured) => {
    const { apiClient, errorReporter } = createApiClientTestContext()
    const error = Object.assign(new Error('Transport unavailable'), {
      __captured: alreadyCaptured,
    })
    xhr.send.mockImplementation(() => {
      throw error
    })
    await expect(
      apiClient.uploadBinary('/media', new File(['file'], 'tablet.png'), {}),
    ).rejects.toBe(error)
    expect(errorReporter.captureException).toHaveBeenCalledTimes(
      alreadyCaptured ? 0 : 1,
    )
  },
)
