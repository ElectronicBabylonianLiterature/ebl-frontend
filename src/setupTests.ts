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

function rangeFallbacks(range: Range): Record<string, unknown> {
  const emptyRectangle = {
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    width: 0,
    height: 0,
  }
  return {
    setStart: _.noop,
    setEnd: _.noop,
    collapse: _.noop,
    selectNodeContents: _.noop,
    cloneRange: () => range,
    getBoundingClientRect: () => emptyRectangle,
    getClientRects: () => {
      const rectangles: unknown[] = []
      return Object.assign(rectangles, {
        item: (index: number) => rectangles[index] ?? null,
      })
    },
    commonAncestorContainer: { nodeName: 'BODY', ownerDocument: document },
  }
}

if (global.document) {
  const originalCreateRange = document.createRange.bind(document)
  document.createRange = (): Range => {
    const range = originalCreateRange()
    Object.entries(rangeFallbacks(range)).forEach(([member, fallback]) => {
      if (!Reflect.get(range, member)) {
        Reflect.set(range, member, fallback)
      }
    })
    return range
  }
}

type CapturedConsoleMethod = 'error' | 'warn'

type ConsoleCapture = {
  readonly spy: jest.SpyInstance
  readonly pattern: RegExp
}

const consoleCaptures = new Map<CapturedConsoleMethod, ConsoleCapture>()

function captureConsole(
  method: CapturedConsoleMethod,
  pattern: RegExp,
): jest.SpyInstance {
  consoleCaptures.get(method)?.spy.mockRestore()
  const spy = jest.spyOn(console, method).mockImplementation()
  consoleCaptures.set(method, { spy, pattern })
  return spy
}

export function expectConsoleErrors(pattern: RegExp): jest.SpyInstance {
  return captureConsole('error', pattern)
}

export function expectConsoleWarnings(pattern: RegExp): jest.SpyInstance {
  return captureConsole('warn', pattern)
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
}

function releaseConsoleCapture({
  spy,
  pattern,
}: ConsoleCapture): CapturedMessages {
  const messages = spy.mock.calls.map((call) =>
    call.map((argument) => String(argument)).join(' '),
  )
  spy.mockRestore()
  return { messages, pattern }
}

function verifyCapturedMessages({ messages, pattern }: CapturedMessages): void {
  const unexpected = messages.filter((message) => !pattern.test(message))
  const matched = messages.filter((message) => pattern.test(message))

  expect(unexpected).toEqual([])
  expect(matched).not.toEqual([])
}

afterEach(() => {
  consoleObservers.splice(0).forEach((spy) => spy.mockRestore())
  const captured = [...consoleCaptures.values()].map(releaseConsoleCapture)
  consoleCaptures.clear()
  captured.forEach(verifyCapturedMessages)
})
