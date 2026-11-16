import { waitFor } from '@testing-library/react'
import { createApiClientTestContext } from 'http/ApiClient.testSupport'
import {
  prepareUploadTransport,
  restoreUploadTransport,
  xhr,
} from 'http/uploadTransport.testSupport'

beforeEach(prepareUploadTransport)
afterEach(restoreUploadTransport)

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
