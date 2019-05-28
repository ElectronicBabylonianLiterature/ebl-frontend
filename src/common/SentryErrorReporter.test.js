import * as Sentry from '@sentry/browser'
import _ from 'lodash'
import SentryErrorReporter from './SentryErrorReporter.js'

const error = new Error('error')
const sentryErrorReporter = new SentryErrorReporter()
let scope

beforeEach(async () => {
  jest.spyOn(Sentry, 'init')
  jest.spyOn(Sentry, 'withScope')
  jest.spyOn(Sentry, 'configureScope')
  jest.spyOn(Sentry, 'captureException')
  jest.spyOn(Sentry, 'showReportDialog')
  Sentry.captureException.mockImplementationOnce(_.noop)
  Sentry.withScope.mockImplementationOnce(f => f(scope))
  Sentry.configureScope.mockImplementationOnce(f => f(scope))
  scope = {
    setExtra: jest.fn(),
    setUser: jest.fn(),
    clear: jest.fn()
  }
})

test('Initialization', () => {
  const dsn = 'http://example.com/sentry'
  const environment = 'test'
  Sentry.init.mockImplementationOnce(_.noop)
  SentryErrorReporter.init(dsn, environment)
  expect(Sentry.init).toHaveBeenCalledWith({
    dsn: dsn,
    environment: environment
  })
})

test('Error reporting', () => {
  const info = { componentStack: 'Error happened!' }
  sentryErrorReporter.captureException(error, info)
  expect(scope.setExtra).toHaveBeenCalledWith(
    'componentStack',
    'Error happened!'
  )
  expect(Sentry.captureException).toHaveBeenCalledWith(error)
})

test('Error reporting no info', () => {
  sentryErrorReporter.captureException(error)
  expect(scope.setExtra).not.toHaveBeenCalled()
  expect(Sentry.captureException).toHaveBeenCalledWith(error)
})

test('Report dialog', () => {
  Sentry.showReportDialog.mockImplementationOnce(_.noop)
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
    eblName: eblName
  })
})

test('Clear scope', () => {
  sentryErrorReporter.clearScope()
  expect(scope.clear).toHaveBeenCalled()
})
