import 'jest-date-mock'
import 'jest-dom/extend-expect'
import 'react-testing-library/cleanup-after-each'
import * as bluebird from 'bluebird'

import './wordFixtures'
import './fragmentFixtures'

global.fetch = require('jest-fetch-mock')

global.URL = {
  createObjectURL: jest.fn(),
  revokeObjectURL: jest.fn()
}

global.AbortController = function AbortControllerMock () {}
global.AbortController.prototype.abort = jest.fn()
global.AbortController.prototype.signal = {
  aborted: false,
  onabort: jest.fn()
}

afterEach(() => {
  global.AbortController.prototype.abort.mockReset()
})

global.Raven = {
  captureException: jest.fn(),
  lastEventId: jest.fn(),
  showReportDialog: jest.fn()
}

afterEach(() => {
  global.Raven.captureException.mockReset()
  global.Raven.lastEventId.mockReset()
  global.Raven.showReportDialog.mockReset()
})

bluebird.config({
  cancellation: true
})

afterEach(() => localStorage.clear())
