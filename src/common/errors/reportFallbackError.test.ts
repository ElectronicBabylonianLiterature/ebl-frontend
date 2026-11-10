import * as Sentry from '@sentry/react'
import SentryErrorReporter from 'common/errors/SentryErrorReporter'
import reportFallbackError from 'common/errors/reportFallbackError'
import { ApiError } from 'http/ApiClient'

afterEach(() => jest.restoreAllMocks())

test.each([401, 403, 404, 500, 503])(
  'preserves the production filter for a recovered HTTP %s failure',
  (status) => {
    const init = jest.spyOn(Sentry, 'init').mockImplementation(() => undefined)
    const capture = jest
      .spyOn(Sentry, 'captureException')
      .mockReturnValue('event-id')
    SentryErrorReporter.init('http://example.com/sentry', 'test')
    const beforeSend = init.mock.calls[0][0]?.beforeSend
    if (!beforeSend) throw new Error('beforeSend was not configured')
    const error = new ApiError('Service unavailable', {}, status)

    reportFallbackError(error)

    const reportedError = capture.mock.calls[0][0] as Error
    expect(reportedError).toBe(error)
    const event = { type: undefined }
    expect(beforeSend(event, { originalException: reportedError })).toBeNull()
    expect(beforeSend(event, { originalException: error })).toBeNull()
  },
)

test('preserves non-HTTP errors', () => {
  const capture = jest
    .spyOn(Sentry, 'captureException')
    .mockReturnValue('event-id')
  const error = new Error('Network unavailable')

  reportFallbackError(error)

  expect(capture).toHaveBeenCalledWith(error)
})
