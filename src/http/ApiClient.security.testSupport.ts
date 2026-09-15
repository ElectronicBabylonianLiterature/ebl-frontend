import { AuthenticationService } from 'auth/Auth'
import { guestSession } from 'auth/Session'

export const mockErrorReporter = {
  captureException: jest.fn(),
}

export function createMockAuthService(
  isAuth: boolean,
  token = 'test-token',
): AuthenticationService {
  return {
    isAuthenticated: () => isAuth,
    getAccessToken: jest.fn().mockResolvedValue(token),
    getSession: () => guestSession,
    login: jest.fn(),
    logout: jest.fn(),
    getUser: () => ({}),
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
