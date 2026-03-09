import * as Sentry from '@sentry/react'
import _ from 'lodash'
import SentryErrorReporter from './SentryErrorReporter'
import { ApiError } from 'http/ApiClient'
import Chance from 'chance'

const chance = new Chance()
const sentryErrorReporter = new SentryErrorReporter()
const dsn = 'http://example.com/sentry'
const environment = 'test'
type ScopeMock = {
  setExtra: jest.Mock
  setUser: jest.Mock
  clear: jest.Mock
}
let scope: ScopeMock
let error
let init
let showReportDialog

beforeEach(async () => {
  scope = {
    setExtra: jest.fn(),
    setUser: jest.fn(),
    clear: jest.fn(),
  }
  error = new Error(chance.sentence())
  init = jest.spyOn(Sentry, 'init')
  showReportDialog = jest.spyOn(Sentry, 'showReportDialog')
  jest
    .spyOn(Sentry, 'withScope')
    .mockImplementationOnce((f) =>
      (f as unknown as (scope: ScopeMock) => void)(scope),
    )
  jest
    .spyOn(Sentry, 'configureScope')
    .mockImplementationOnce((f) =>
      (f as unknown as (scope: ScopeMock) => void)(scope),
    )
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
  expect(scope.setExtra).toHaveBeenCalledWith(
    'componentStack',
    'Error happened!',
  )
  expect(Sentry.captureException).toHaveBeenCalledWith(error)
})

describe('beforeSend', () => {
  let beforeSend

  beforeEach(() => {
    init.mockImplementationOnce(_.noop)
    SentryErrorReporter.init(dsn, environment)
    beforeSend = init.mock.calls[0][0]['beforeSend']
  })

  test('Ignores ApiError', () => {
    const apiError = new ApiError('msg', {})
    expect(beforeSend({}, { originalException: apiError })).toBeNull()
  })

  test('Ignores AbortError', () => {
    const abortError = new Error('msg')
    abortError.name = 'AbortError'
    expect(beforeSend({}, { originalException: abortError })).toBeNull()
  })

  test('Does not ignore other errors', () => {
    const event = {}
    expect(beforeSend(event, { originalException: error })).toBe(event)
  })
})

test('Error reporting no info', () => {
  sentryErrorReporter.captureException(error)
  expect(scope.setExtra).not.toHaveBeenCalled()
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
  expect(scope.setUser).toHaveBeenCalledWith({
    id: sub,
    username: username,
    eblName: eblName,
  })
})

test('Clear scope', () => {
  sentryErrorReporter.clearScope()
  expect(scope.clear).toHaveBeenCalled()
})
