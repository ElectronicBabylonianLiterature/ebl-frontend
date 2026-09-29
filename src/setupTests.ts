import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parse as parseEnv } from 'dotenv'
import 'jest-date-mock'
import '@testing-library/jest-dom'
import _ from 'lodash'
import { TextEncoder, TextDecoder } from 'util'

import 'test-support/bibliography-fixtures'
import 'test-support/fragment-fixtures'
import 'test-support/word-fixtures'
import 'test-support/sign-fixtures'
import 'jest-canvas-mock'

import fetchMock from 'jest-fetch-mock'

const testEnv = parseEnv(readFileSync(resolve(__dirname, '..', '.env.test')))
Object.entries(testEnv).forEach(([key, value]) => {
  process.env[key] = String(value)
})

jest.mock('react-router-dom', () => {
  const mockReact = jest.requireActual('react')
  const actualReactRouterDom = jest.requireActual('react-router-dom')
  return {
    ...actualReactRouterDom,
    MemoryRouter: ({ children, ...props }: Record<string, unknown>) =>
      mockReact.createElement(
        actualReactRouterDom.MemoryRouter,
        {
          ...props,
          future: Object.fromEntries([
            ['v7_startTransition', true],
            ['v7_relativeSplatPath', true],
          ]),
        },
        children,
      ),
  }
})

fetchMock.enableMocks()

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder

const abort = jest.fn()
const onAbort = jest.fn()

global.URL.createObjectURL = jest.fn()
global.URL.revokeObjectURL = jest.fn()
try {
  window.scrollTo = jest.fn()
} catch {
  Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
    writable: true,
    configurable: true,
  })
}

if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = jest.fn()
}

afterEach(() => {
  abort.mockReset()
  onAbort.mockReset()
})

afterEach(() => localStorage.clear())

if (global.document) {
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
    if (!range.getClientRects) {
      range.getClientRects = () => {
        const rects: DOMRect[] = []
        return Object.assign(rects, {
          item: (index: number) => rects[index] ?? null,
        }) as DOMRectList
      }
    }
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

type CapturedConsoleMethod = 'error' | 'warn'

type ConsoleCapture = {
  readonly spy: jest.SpyInstance
  readonly pattern: RegExp
  readonly isRequired: boolean
}

const consoleCaptures = new Map<CapturedConsoleMethod, ConsoleCapture>()

function captureConsole(
  method: CapturedConsoleMethod,
  pattern: RegExp,
  isRequired: boolean,
): jest.SpyInstance {
  consoleCaptures.get(method)?.spy.mockRestore()
  const spy = jest.spyOn(console, method).mockImplementation()
  consoleCaptures.set(method, { spy, pattern, isRequired })
  return spy
}

export function expectConsoleErrors(pattern: RegExp): jest.SpyInstance {
  return captureConsole('error', pattern, true)
}

export function tolerateConsoleErrors(pattern: RegExp): jest.SpyInstance {
  return captureConsole('error', pattern, false)
}

export function expectConsoleWarnings(pattern: RegExp): jest.SpyInstance {
  return captureConsole('warn', pattern, true)
}

const consoleObservers: jest.SpyInstance[] = []

export function observeConsole(
  method: CapturedConsoleMethod,
): jest.SpyInstance {
  const spy = jest.spyOn(console, method)
  consoleObservers.push(spy)
  return spy
}

type CapturedMessages = {
  readonly messages: readonly string[]
  readonly pattern: RegExp
  readonly isRequired: boolean
}

function releaseConsoleCapture({
  spy,
  pattern,
  isRequired,
}: ConsoleCapture): CapturedMessages {
  const messages = spy.mock.calls.map((call) =>
    call.map((argument) => String(argument)).join(' '),
  )
  spy.mockRestore()
  return { messages, pattern, isRequired }
}

function verifyCapturedMessages({
  messages,
  pattern,
  isRequired,
}: CapturedMessages): void {
  const unexpected = messages.filter((message) => !pattern.test(message))
  const matched = messages.filter((message) => pattern.test(message))

  expect(unexpected).toEqual([])
  if (isRequired) {
    expect(matched).not.toEqual([])
  }
}

afterEach(() => {
  consoleObservers.splice(0).forEach((spy) => spy.mockRestore())
  const captured = [...consoleCaptures.values()].map(releaseConsoleCapture)
  consoleCaptures.clear()
  captured.forEach(verifyCapturedMessages)
})
