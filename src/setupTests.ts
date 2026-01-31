import 'jest-date-mock'
import '@testing-library/jest-dom'
import Promise from 'bluebird'
import _ from 'lodash'
import { TextEncoder, TextDecoder } from 'util'

import 'test-support/bibliography-fixtures'
import 'test-support/fragment-fixtures'
import 'test-support/word-fixtures'
import 'test-support/sign-fixtures'
import 'jest-canvas-mock'

import fetchMock from 'jest-fetch-mock'

fetchMock.enableMocks()

// Polyfill for TextEncoder/TextDecoder required by some dependencies
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder

const abort = jest.fn()
const onAbort = jest.fn()

global.URL.createObjectURL = jest.fn()
global.URL.revokeObjectURL = jest.fn()

afterEach(() => {
  abort.mockReset()
  onAbort.mockReset()
})

Promise.config({
  cancellation: true,
})

afterEach(() => localStorage.clear())

if (global.document) {
  // Fixes "TypeError: document.createRange is not a function" with Popover.
  // See: https://github.com/FezVrasta/popper.js/issues/478
  document.createRange = () => ({
    setStart: _.noop,
    setEnd: _.noop,
    // @ts-expect-error - partial mock for testing
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
  })
}

export function silenceConsoleErrors(): void {
  jest.spyOn(console, 'error').mockImplementation()
}
