import { waitFor } from '@testing-library/react'
import { createApiClientTestContext } from 'http/ApiClient.testSupport'
import {
  prepareUploadTransport,
  restoreUploadTransport,
  xhr,
} from 'http/uploadTransport.testSupport'

beforeEach(prepareUploadTransport)
afterEach(restoreUploadTransport)

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
