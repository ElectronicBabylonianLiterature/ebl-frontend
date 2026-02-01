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
  const originalCreateRange = document.createRange?.bind(document)
  document.createRange = () => {
    const range = originalCreateRange ? originalCreateRange() : ({} as Range)
    if (!range.setStart) range.setStart = _.noop
    if (!range.setEnd) range.setEnd = _.noop
    if (!range.collapse) range.collapse = _.noop
    if (!range.selectNodeContents) range.selectNodeContents = _.noop
    if (!range.cloneRange) range.cloneRange = () => range
    if (!range.getBoundingClientRect) {
      range.getBoundingClientRect = () =>
        ({
          right: 0,
          left: 0,
          top: 0,
          bottom: 0,
          width: 0,
          height: 0,
        }) as DOMRect
    }
    if (!range.getClientRects) range.getClientRects = () => [] as DOMRectList
    if (!range.commonAncestorContainer) {
      // @ts-expect-error - partial mock for testing
      range.commonAncestorContainer = {
        nodeName: 'BODY',
        ownerDocument: document,
      }
    }
    return range
  }
}

export function silenceConsoleErrors(): void {
  jest.spyOn(console, 'error').mockImplementation()
}
