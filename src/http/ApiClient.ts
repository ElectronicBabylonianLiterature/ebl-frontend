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

  constructor(message: string, data: unknown) {
    super(message)
    this.name = this.constructor.name
    this.data = data
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
          new ApiError(ApiError.bodyToMessage(body, response.statusText), body)
      )
      .catch(() => new ApiError(response.statusText, {}))
  }

  static bodyToMessage(
    body: { [key: string]: unknown },
    statusText: string
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
    statusText: string
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
    headers: Record<string, string>
  ): Promise<Headers> {
    const defaultHeaders: Record<string, string> =
      authenticate || this.auth.isAuthenticated()
        ? { Authorization: `Bearer ${await this.auth.getAccessToken()}` }
        : {}
    return new Headers({
      ...defaultHeaders,
      ...headers,
    })
  }

  fetch(
    path: string,
    authenticate: boolean,
    options: Options
  ): Bluebird<Response> {
    return new Bluebird<Headers>((resolve, reject) => {
      this.createHeaders(authenticate, options.headers ?? {})
        .then(resolve)
        .catch(reject)
    })
      .then((headers) =>
        cancellableFetch(apiUrl(path), {
          ...options,
          headers: headers,
        })
      )
      .then(async (response) => {
        if (response.ok) {
          return response
        } else {
          throw await ApiError.fromResponse(response)
        }
      })
      .catch((error) => {
        this.errorReporter.captureException(error)
        throw error
      })
  }

  fetchJson(path: string, authenticate: boolean): Bluebird<any> {
    return this.fetch(path, authenticate, {}).then((response) =>
      response.json()
    )
  }

  fetchBlob(path: string, authenticate: boolean): Bluebird<Blob> {
    return this.fetch(path, authenticate, {}).then((response) =>
      response.blob()
    )
  }

  postJson(path: string, body: unknown, authenticate = true): Bluebird<any> {
    return this.fetch(path, authenticate, createOptions(body, 'POST')).then(
      deserializeJson
    )
  }

  putJson(path: string, body: unknown): Bluebird<any> {
    return this.fetch(path, true, createOptions(body, 'PUT')).then(
      deserializeJson
    )
  }
}
