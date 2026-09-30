import ApiClient, { AccessTokenProvider } from 'http/ApiClient'

export const accessToken = 'test-token'
export const path = '/test-endpoint'

export interface ApiClientTestContext {
  apiClient: ApiClient
  auth: jest.Mocked<AccessTokenProvider>
  errorReporter: { captureException: jest.Mock }
}

export function createApiClientTestContext(): ApiClientTestContext {
  fetchMock.resetMocks()
  const auth: jest.Mocked<AccessTokenProvider> = {
    getAccessToken: jest.fn().mockResolvedValue(accessToken),
    isAuthenticated: jest.fn().mockReturnValue(true),
  }
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
}: JsonResponseOptions): Response {
  const serializedBody = body === null ? '' : JSON.stringify(body)
  return {
    ok: ok,
    status: status,
    statusText: statusText,
    json: async () => JSON.parse(serializedBody),
    text: async () => serializedBody,
  } as Response
}
