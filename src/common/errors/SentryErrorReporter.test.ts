import * as Sentry from '@sentry/react'
import _ from 'lodash'
import SentryErrorReporter from 'common/errors/SentryErrorReporter'
import { ApiError } from 'http/ApiClient'
import Chance from 'chance'

const chance = new Chance('SentryErrorReporter')
const sentryErrorReporter = new SentryErrorReporter()
const dsn = 'http://example.com/sentry'
const environment = 'test'
let setExtra: jest.SpyInstance
let setUser: jest.SpyInstance
let clear: jest.SpyInstance
let error: Error
let init: jest.SpyInstance<void, Parameters<typeof Sentry.init>>
let showReportDialog: jest.SpyInstance<
  void,
  Parameters<typeof Sentry.showReportDialog>
>

beforeEach(async () => {
  setExtra = jest.spyOn(Sentry.Scope.prototype, 'setExtra')
  setUser = jest.spyOn(Sentry.Scope.prototype, 'setUser')
  clear = jest.spyOn(Sentry.Scope.prototype, 'clear')
  jest
    .spyOn(Sentry, 'configureScope')
    .mockImplementationOnce((callback) => callback(new Sentry.Scope()))
  error = new Error(chance.sentence())
  init = jest.spyOn(Sentry, 'init')
  showReportDialog = jest.spyOn(Sentry, 'showReportDialog')
  jest
    .spyOn(Sentry, 'captureException')
    .mockImplementationOnce((exception) => exception.message)
})

test('Initialization', () => {
  init.mockImplementationOnce(_.noop)
  SentryErrorReporter.init(dsn, environment)
  expect(Sentry.init).toHaveBeenCalledWith({
    dsn: dsn,
    environment: environment,
    beforeSend: expect.any(Function),
  })
})

test('Error reporting', () => {
  const info = { componentStack: 'Error happened!' }
  sentryErrorReporter.captureException(error, info)
  expect(setExtra).toHaveBeenCalledWith('componentStack', 'Error happened!')
  expect(Sentry.captureException).toHaveBeenCalledWith(error)
})

describe('beforeSend', () => {
  type BeforeSend = NonNullable<Sentry.BrowserOptions['beforeSend']>
  const errorEvent: Parameters<BeforeSend>[0] = { type: undefined }
  let beforeSend: BeforeSend

  beforeEach(() => {
    init.mockImplementationOnce(_.noop)
    SentryErrorReporter.init(dsn, environment)
    const configured = init.mock.calls[0][0]?.beforeSend
    if (!configured) throw new Error('beforeSend was not configured')
    beforeSend = configured
  })

  test('Ignores ApiError', () => {
    const apiError = new ApiError('msg', {})
    expect(beforeSend(errorEvent, { originalException: apiError })).toBeNull()
  })

  test('Ignores AbortError', () => {
    const abortError = new Error('msg')
    abortError.name = 'AbortError'
    expect(beforeSend(errorEvent, { originalException: abortError })).toBeNull()
  })

  test('Does not ignore other errors', () => {
    expect(beforeSend(errorEvent, { originalException: error })).toBe(
      errorEvent,
    )
  })
})

test('Error reporting no info', () => {
  sentryErrorReporter.captureException(error)
  expect(setExtra).not.toHaveBeenCalled()
  expect(Sentry.captureException).toHaveBeenCalledWith(error)
})

test('Report dialog', () => {
  showReportDialog.mockImplementationOnce(_.noop)
  sentryErrorReporter.showReportDialog()
  expect(Sentry.showReportDialog).toHaveBeenCalled()
})

test('Capturing user', () => {
  const sub = 'auth0|1234'
  const username = 'test@example.com'
  const eblName = 'Test'
  sentryErrorReporter.setUser(sub, username, eblName)
  expect(setUser).toHaveBeenCalledWith({
    id: sub,
    username: username,
    eblName: eblName,
  })
})

test('Clear scope', () => {
  sentryErrorReporter.clearScope()
  expect(clear).toHaveBeenCalled()
})
