import { screen } from '@testing-library/react'
import type { Root } from 'react-dom/client'
import type { ErrorReporter } from 'ErrorReporterContext'

const mockRoots: Root[] = []
const mockSentryInit: jest.MockedFunction<
  (dsn: string, environment: string) => void
> = jest.fn()
const mockUnregister: jest.MockedFunction<() => void> = jest.fn()
const mockInjectedApp: jest.MockedFunction<
  (props: { errorReporter: ErrorReporter }) => void
> = jest.fn()

jest.mock('bootstrap/dist/css/bootstrap.min.css', () => ({}))
jest.mock('react-dom/client', () => {
  const actual = jest.requireActual('react-dom/client')
  return {
    ...actual,
    createRoot: (container: Element): Root => {
      const root = actual.createRoot(container)
      mockRoots.push(root)
      return root
    },
  }
})
jest.mock('common/errors/SentryErrorReporter', () => ({
  __esModule: true,
  default: class {
    static init(dsn: string, environment: string): void {
      mockSentryInit(dsn, environment)
    }
  },
}))
jest.mock('serviceWorker', () => ({ unregister: () => mockUnregister() }))
jest.mock('auth/InjectedAuth0Provider', () => ({
  __esModule: true,
  default: ({ children }: { children: JSX.Element }) => children,
}))
jest.mock('InjectedApp', () => ({
  __esModule: true,
  default: (props: { errorReporter: ErrorReporter }): string => {
    mockInjectedApp(props)
    return 'Injected application'
  },
}))

const originalEnv = { ...process.env }

type Act = typeof import('react').act

let act: Act

async function bootstrap(): Promise<void> {
  await act(async () => {
    await import('index')
  })
  expect(screen.getByText('Injected application')).toBeInTheDocument()
}

beforeEach(async () => {
  jest.resetModules()
  act = (await import('react')).act
  document.body.innerHTML = '<div id="root"></div>'
})

afterEach(() => {
  act(() => mockRoots.splice(0).forEach((root) => root.unmount()))
  process.env = { ...originalEnv }
  document.body.innerHTML = ''
})

test('renders the injected application with the Sentry error reporter', async () => {
  await bootstrap()
  const { default: SentryErrorReporter } =
    await import('common/errors/SentryErrorReporter')
  expect(mockInjectedApp).toHaveBeenCalledWith({
    errorReporter: expect.any(SentryErrorReporter),
  })
  expect(mockUnregister).toHaveBeenCalledTimes(1)
})

test('does not initialise Sentry without a DSN', async () => {
  delete process.env.REACT_APP_SENTRY_DSN
  await bootstrap()
  expect(mockSentryInit).not.toHaveBeenCalled()
})

test('initialises Sentry with the DSN and environment', async () => {
  process.env.REACT_APP_SENTRY_DSN = 'https://sentry.example/1'
  await bootstrap()
  expect(mockSentryInit).toHaveBeenCalledWith(
    'https://sentry.example/1',
    process.env.NODE_ENV,
  )
})

test('fails when the root element is missing', async () => {
  document.body.innerHTML = ''
  await expect(import('index')).rejects.toThrow(
    'Failed to find the root element',
  )
  expect(mockRoots).toHaveLength(0)
})
