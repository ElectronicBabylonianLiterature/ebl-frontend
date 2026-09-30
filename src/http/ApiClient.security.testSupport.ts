import { AccessTokenProvider } from 'http/ApiClient'

export const mockErrorReporter = {
  captureException: jest.fn(),
}

export function createMockAuthService(
  isAuth: boolean,
  token = 'test-token',
): AccessTokenProvider {
  return {
    isAuthenticated: () => isAuth,
    getAccessToken: jest.fn().mockResolvedValue(token),
  }
}

export function restoreFetchAroundTests(): void {
  let originalFetch: typeof global.fetch

  beforeAll(() => {
    originalFetch = global.fetch
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockErrorReporter.captureException.mockClear()
  })
}
