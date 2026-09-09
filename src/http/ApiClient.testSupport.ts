import ApiClient from 'http/ApiClient'
import { AuthenticationService } from 'auth/Auth'

export const accessToken = 'test-token'
export const path = '/test-endpoint'

export interface ApiClientTestContext {
  apiClient: ApiClient
  auth: jest.Mocked<AuthenticationService>
  errorReporter: { captureException: jest.Mock }
}

export function createApiClientTestContext(): ApiClientTestContext {
  fetchMock.resetMocks()
  const auth = {
    getAccessToken: jest.fn().mockResolvedValue(accessToken),
    isAuthenticated: jest.fn().mockReturnValue(true),
  } as unknown as jest.Mocked<AuthenticationService>
  const errorReporter = { captureException: jest.fn() }

  return {
    apiClient: new ApiClient(auth, errorReporter),
    auth: auth,
    errorReporter: errorReporter,
  }
}

export interface JsonResponseOptions {
  ok?: boolean
  status?: number
  statusText?: string
  body?: unknown
}

export function createJsonResponse({
  ok = true,
  status = 200,
  statusText = 'OK',
  body = null,
}: JsonResponseOptions = {}): Response {
  const serializedBody = body === null ? '' : JSON.stringify(body)
  return {
    ok: ok,
    status: status,
    statusText: statusText,
    json: async () => JSON.parse(serializedBody),
    text: async () => serializedBody,
  } as Response
}
