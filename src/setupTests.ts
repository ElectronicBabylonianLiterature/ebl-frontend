import 'jest-date-mock'
import '@testing-library/jest-dom/extend-expect'
import Promise from 'bluebird'
import _ from 'lodash'

import 'test-support/bibliography-fixtures'
import 'test-support/fragment-fixtures'
import 'test-support/word-fixtures'

import fetchMock from 'jest-fetch-mock'

fetchMock.enableMocks()

const abort = jest.fn()
const onAbort = jest.fn()

interface CustomGlobal extends NodeJS.Global {
  URL: any
  document: Document
}

const customGlobal: CustomGlobal = global as CustomGlobal

customGlobal.URL = {
  createObjectURL: jest.fn(),
  revokeObjectURL: jest.fn(),
}

afterEach(() => {
  abort.mockReset()
  onAbort.mockReset()
})

Promise.config({
  cancellation: true,
})

afterEach(() => localStorage.clear())

if (customGlobal.document) {
  // Fixes "TypeError: document.createRange is not a function" with Popover.
  // See: https://github.com/FezVrasta/popper.js/issues/478
  document.createRange = () => ({
    setStart: _.noop,
    setEnd: _.noop,
    // @ts-ignore
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
  })
}
