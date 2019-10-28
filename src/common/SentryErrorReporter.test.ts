import * as Sentry from '@sentry/browser'
import _ from 'lodash'
import SentryErrorReporter from './SentryErrorReporter'
import { ApiError } from 'http/ApiClient'
import Chance from 'chance'

const chance = new Chance()
const sentryErrorReporter = new SentryErrorReporter()
let scope
let error
let init
let showReportDialog

beforeEach(async () => {
  scope = {
    setExtra: jest.fn(),
    setUser: jest.fn(),
    clear: jest.fn()
  }
  error = new Error(chance.sentence())
  init = jest.spyOn(Sentry, 'init')
  showReportDialog = jest.spyOn(Sentry, 'showReportDialog')
  jest.spyOn(Sentry, 'withScope').mockImplementationOnce(f => f(scope))
  jest.spyOn(Sentry, 'configureScope').mockImplementationOnce(f => f(scope))
  jest
    .spyOn(Sentry, 'captureException')
    .mockImplementationOnce(exception => exception.message)
})

test('Initialization', () => {
  const dsn = 'http://example.com/sentry'
  const environment = 'test'
  init.mockImplementationOnce(_.noop)
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

test('Ignores ApiError', () => {
  const apiError = new ApiError('msg', {})
  sentryErrorReporter.captureException(apiError)
  expect(scope.setExtra).not.toHaveBeenCalled()
  expect(Sentry.captureException).not.toHaveBeenCalledWith(apiError)
})

test('Ignores AbortError', () => {
  const abortError = new Error('msg')
  abortError.name = 'AbortError'
  sentryErrorReporter.captureException(abortError)
  expect(scope.setExtra).not.toHaveBeenCalled()
  expect(Sentry.captureException).not.toHaveBeenCalledWith(abortError)
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
    eblName: eblName
  })
})

test('Clear scope', () => {
  sentryErrorReporter.clearScope()
  expect(scope.clear).toHaveBeenCalled()
})
