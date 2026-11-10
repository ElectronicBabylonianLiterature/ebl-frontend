import { AuthenticationService } from 'auth/Auth'
import { ErrorReporter } from 'ErrorReporterContext'
import { createAbortError, isAbortError } from 'common/utils/abortError'
import { ApiError } from './ApiError'
import { BinaryUploadOptions, uploadBinaryRequest } from './binaryUpload'

export { ApiError } from './ApiError'

export type AccessTokenProvider = Pick<
  AuthenticationService,
  'getAccessToken' | 'isAuthenticated'
>

type Options = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

type ErrorCapturer = Pick<ErrorReporter, 'captureException'>

export function apiUrl(path: string): string {
  return `${process.env.REACT_APP_DICTIONARY_API_URL}${path}`
}

async function deserializeJson(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null
  }
  // Any success status may legitimately carry an empty body.
  const responseText = await response.text()
  return responseText.trim() ? JSON.parse(responseText) : null
}

function createOptions(body: unknown, method: string): Options {
  return {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    method: method,
  }
}
export default class ApiClient {
  private readonly auth: AccessTokenProvider
  private readonly errorReporter: ErrorCapturer

  constructor(auth: AccessTokenProvider, errorReporter: ErrorCapturer) {
    this.auth = auth
    this.errorReporter = errorReporter
  }

  async createHeaders(
    authenticate: boolean,
    headers: Record<string, string>,
    path: string,
  ): Promise<Headers> {
    const defaultHeaders: Record<string, string> =
      authenticate || this.auth.isAuthenticated()
        ? {
            Authorization: `Bearer ${await this.getAccessTokenWithRetry(path)}`,
          }
        : {}
    return new Headers({
      ...defaultHeaders,
      ...headers,
    })
  }

  private async getAccessTokenWithRetry(path: string): Promise<string> {
    return this.tryGetAccessToken(path, 0)
  }

  private async tryGetAccessToken(
    path: string,
    attempt: number,
  ): Promise<string> {
    try {
      return await this.auth.getAccessToken()
    } catch (error) {
      const authError = error as Error & { __captured?: boolean }
      if (!authError.__captured) {
        authError.__captured = true
        this.errorReporter.captureException(authError, {
          event: 'auth_token_error',
          endpoint: path,
          attempt,
          auth0Error: authError.message,
        })
      }
      if (attempt < 1) {
        return this.tryGetAccessToken(path, attempt + 1)
      }
      throw authError
    }
  }

  private async fetch(
    path: string,
    authenticate: boolean,
    options: Options,
    signal?: AbortSignal,
    onDispatched?: () => void,
  ): Promise<Response> {
    try {
      const headers = await this.createHeaders(
        authenticate,
        options.headers ?? {},
        path,
      )
      if (signal?.aborted) throw createAbortError(signal)
      const pending = fetch(apiUrl(path), {
        ...options,
        headers,
        ...(signal ? { signal } : {}),
      })
      onDispatched?.()
      const response = await pending
      if (response.ok) {
        return response
      }
      throw await ApiError.fromResponse(response)
    } catch (error) {
      if (!isAbortError(error))
        this.captureRequestError(error as Error, path, options.method ?? 'GET')
      throw error
    }
  }

  private captureRequestError(
    error: Error & { __captured?: boolean },
    path: string,
    method: string,
  ): void {
    if (error.__captured) return
    const errorInfo: Record<string, unknown> = { endpoint: path, method }
    if (error instanceof ApiError && error.status) {
      errorInfo.status = error.status
      if (error.status === 401 || error.status === 403) {
        errorInfo.authError = true
      }
    }
    this.errorReporter.captureException(error, errorInfo)
  }

  fetchJson<T = unknown>(
    path: string,
    authenticate: boolean,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.fetch(path, authenticate, {}, signal).then((response) =>
      response.json(),
    ) as Promise<T>
  }

  fetchBlob(
    path: string,
    authenticate: boolean,
    signal?: AbortSignal,
  ): Promise<Blob> {
    return this.fetch(path, authenticate, {}, signal).then((response) =>
      response.blob(),
    )
  }

  postJson<T = unknown>(
    path: string,
    body: unknown,
    authenticate = true,
  ): Promise<T> {
    return this.fetch(path, authenticate, createOptions(body, 'POST')).then(
      deserializeJson,
    ) as Promise<T>
  }

  putJson<T = unknown>(path: string, body: unknown): Promise<T> {
    return this.fetch(path, true, createOptions(body, 'PUT')).then(
      deserializeJson,
    ) as Promise<T>
  }

  requestJson<T = unknown>(
    path: string,
    method: 'POST' | 'PATCH' | 'DELETE',
    body: unknown,
    signal?: AbortSignal,
    onDispatched?: () => void,
  ): Promise<T> {
    return this.fetch(
      path,
      true,
      createOptions(body, method),
      signal,
      onDispatched,
    ).then(deserializeJson) as Promise<T>
  }

  async uploadBinary<T = unknown>(
    path: string,
    file: File,
    headers: Record<string, string>,
    options: BinaryUploadOptions = {},
  ): Promise<T> {
    const authenticatedHeaders = await this.createHeaders(true, headers, path)
    return uploadBinaryRequest<T>(
      apiUrl(path),
      file,
      authenticatedHeaders,
      options,
    ).catch((error) => {
      if (!isAbortError(error)) this.captureUploadError(error, path)
      throw error
    })
  }

  private captureUploadError(error: Error, path: string): void {
    const captured = error as Error & { __captured?: boolean }
    if (captured.__captured) return
    captured.__captured = true
    this.errorReporter.captureException(captured, {
      endpoint: path,
      method: 'POST',
      ...(error instanceof ApiError ? { status: error.status } : {}),
    })
  }
}
