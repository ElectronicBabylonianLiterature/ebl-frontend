import 'jest-date-mock'
import '@testing-library/jest-dom/extend-expect'
import Promise from 'bluebird'

import 'test-helpers/bibliography-fixtures'
import 'test-helpers/fragment-fixtures'
import 'test-helpers/word-fixtures'

import { GlobalWithFetchMock } from 'jest-fetch-mock'

const abort = jest.fn()
const onAbort = jest.fn()
class AbortControllerMock {
  abort = abort
  signal = {
    aborted: false,
    onabort: onAbort
  }
}

interface CustomGlobal extends GlobalWithFetchMock {
  URL: any
  AbortController: typeof AbortControllerMock
  document: Document
}

const customGlobal: CustomGlobal = global as CustomGlobal
customGlobal.fetch = require('jest-fetch-mock')
customGlobal.fetchMock = customGlobal.fetch

customGlobal.URL = {
  createObjectURL: jest.fn(),
  revokeObjectURL: jest.fn()
}
customGlobal.AbortController = AbortControllerMock

afterEach(() => {
  abort.mockReset()
  onAbort.mockReset()
})

Promise.config({
  cancellation: true
})

afterEach(() => localStorage.clear())

if (customGlobal.document) {
  // Fixes "TypeError: document.createRange is not a function" with Popover.
  // See: https://github.com/FezVrasta/popper.js/issues/478
  document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    // @ts-ignore
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document
    }
  })
}
