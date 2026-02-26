import _ from 'lodash'
import Bluebird from 'bluebird'
import cancellableFetch from './cancellableFetch'
import { AuthenticationService } from 'auth/Auth'
import { ErrorReporter } from 'ErrorReporterContext'

type Options = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

type ErrorCapturer = Pick<ErrorReporter, 'captureException'>

export function apiUrl(path: string): string {
  return `${process.env.REACT_APP_DICTIONARY_API_URL}${path}`
}

function deserializeJson(response: Response): unknown {
  return [201, 204].includes(response.status) ? null : response.json()
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
export class ApiError extends Error {
  readonly data: unknown
  readonly status?: number

  constructor(message: string, data: unknown, status?: number) {
    super(message)
    this.name = this.constructor.name
    this.data = data
    this.status = status
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = new Error(message).stack
    }
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    return response
      .json()
      .then(
        (body) =>
          new ApiError(
            ApiError.bodyToMessage(body, response.statusText),
            body,
            response.status,
          ),
      )
      .catch(() => new ApiError(response.statusText, {}, response.status))
  }

  static bodyToMessage(
    body: { [key: string]: unknown },
    statusText: string,
  ): string {
    if (_.isString(body.description)) {
      return body.description
    } else if (body.description || body.title) {
      return ApiError.titleAndDescriptionToMessage(body, statusText)
    } else {
      return JSON.stringify(body)
    }
  }

  private static titleAndDescriptionToMessage(
    body: { [key: string]: unknown },
    statusText: string,
  ) {
    const title = body.title || statusText
    const description = body.description
      ? ': ' + JSON.stringify(body.description)
      : ''
    return `${title}${description}`
  }
}

export default class ApiClient {
  private readonly auth: AuthenticationService
  private readonly errorReporter: ErrorCapturer

  constructor(auth: AuthenticationService, errorReporter: ErrorCapturer) {
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

  fetch(
    path: string,
    authenticate: boolean,
    options: Options,
  ): Bluebird<Response> {
    return new Bluebird<Headers>((resolve, reject) => {
      this.createHeaders(authenticate, options.headers ?? {}, path)
        .then(resolve)
        .catch(reject)
    })
      .then((headers) =>
        cancellableFetch(apiUrl(path), {
          ...options,
          headers: headers,
        }),
      )
      .then(async (response) => {
        if (response.ok) {
          return response
        } else {
          throw await ApiError.fromResponse(response)
        }
      })
      .catch((error) => {
        const capturedError = error as Error & { __captured?: boolean }
        if (!capturedError.__captured) {
          const errorInfo: Record<string, unknown> = {
            endpoint: path,
            method: options.method ?? 'GET',
          }
          if (error instanceof ApiError && error.status) {
            errorInfo.status = error.status
            if (error.status === 401 || error.status === 403) {
              errorInfo.authError = true
            }
          }
          this.errorReporter.captureException(capturedError, errorInfo)
        }
        throw error
      })
  }

  fetchJson<T = unknown>(path: string, authenticate: boolean): Bluebird<T> {
    return this.fetch(path, authenticate, {}).then((response) =>
      response.json(),
    ) as Bluebird<T>
  }

  fetchBlob(path: string, authenticate: boolean): Bluebird<Blob> {
    return this.fetch(path, authenticate, {}).then((response) =>
      response.blob(),
    )
  }

  postJson<T = unknown>(
    path: string,
    body: unknown,
    authenticate = true,
  ): Bluebird<T> {
    return this.fetch(path, authenticate, createOptions(body, 'POST')).then(
      deserializeJson,
    ) as Bluebird<T>
  }

  putJson<T = unknown>(path: string, body: unknown): Bluebird<T> {
    return this.fetch(path, true, createOptions(body, 'PUT')).then(
      deserializeJson,
    ) as Bluebird<T>
  }
}
