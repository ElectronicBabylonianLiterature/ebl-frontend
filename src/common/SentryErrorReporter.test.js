import * as Sentry from '@sentry/browser'
import _ from 'lodash'
import SentryErrorReporter from './SentryErrorReporter.js'

const error = new Error('error')
const sentryErrorReporter = new SentryErrorReporter()

beforeEach(async () => {
  jest.spyOn(Sentry, 'init')
  jest.spyOn(Sentry, 'withScope')
  jest.spyOn(Sentry, 'captureException')
  jest.spyOn(Sentry, 'showReportDialog')
})

test('Initialization', () => {
  Sentry.init.mockImplementationOnce(_.noop)
  SentryErrorReporter.init()
  expect(Sentry.init).toHaveBeenCalledWith({ dsn: 'http://example.com/sentry' })
})

test('Error reporting', async () => {
  const info = { componentStack: 'Error happened!' }
  const scope = {
    setExtra: jest.fn()
  }
  Sentry.captureException.mockImplementationOnce(_.noop)
  Sentry.withScope.mockImplementationOnce(f => f(scope))
  sentryErrorReporter.captureException(error, info)
  expect(scope.setExtra).toHaveBeenCalledWith('componentStack', 'Error happened!')
  expect(Sentry.captureException).toHaveBeenCalledWith(error)
})

test('Report dialog', async () => {
  Sentry.showReportDialog.mockImplementationOnce(_.noop)
  sentryErrorReporter.showReportDialog()
  expect(Sentry.showReportDialog).toHaveBeenCalled()
})
