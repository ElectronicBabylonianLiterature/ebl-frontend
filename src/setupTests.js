import 'jest-date-mock'
import 'jest-dom/extend-expect'
import 'react-testing-library/cleanup-after-each'
import * as bluebird from 'bluebird'

import './bibliographyFixtures'
import './fragmentFixtures'
import './wordFixtures'

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

bluebird.config({
  cancellation: true
})

afterEach(() => localStorage.clear())

if (global.document) {
  // Fixes "TypeError: document.createRange is not a function" with Popover.
  // See: https://github.com/FezVrasta/popper.js/issues/478
  document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document
    }
  })
}
