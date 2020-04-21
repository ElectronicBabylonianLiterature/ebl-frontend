import Bluebird from 'bluebird'
import cancellableFetch from './cancellableFetch'
import { AuthenticationService } from 'auth/Auth'

export function apiUrl(path): string {
  return `${process.env.REACT_APP_DICTIONARY_API_URL}${path}`
}

function deserializeJson(response): any {
  return [201, 204].includes(response.status) ? null : response.json()
}

function createOptions(body, method): RequestInit {
  return {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    method: method,
  }
}
export class ApiError extends Error {
  readonly data: object

  constructor(message: string, data: object) {
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
        (body) => new ApiError(body.description || response.statusText, body)
      )
      .catch(() => new ApiError(response.statusText, {}))
  }
}

export default class ApiClient {
  private readonly auth
  private readonly errorReporter

  constructor(auth: AuthenticationService, errorReporter) {
    this.auth = auth
    this.errorReporter = errorReporter
  }

  async createHeaders(authenticate, headers): Promise<Headers> {
    const defaultHeaders = authenticate
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
    options: RequestInit
  ): Bluebird<Response> {
    return new Bluebird<Headers>((resolve, reject) => {
      this.createHeaders(authenticate, options.headers)
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

  fetchJson(path, authenticate): Bluebird<any> {
    return this.fetch(path, authenticate, {}).then((response) =>
      response.json()
    )
  }

  fetchBlob(path: string, authenticate: boolean): Bluebird<Blob> {
    return this.fetch(path, authenticate, {}).then((response) =>
      response.blob()
    )
  }

  postJson(path, body): Bluebird<any> {
    return this.fetch(path, true, createOptions(body, 'POST')).then(
      deserializeJson
    )
  }

  putJson(path, body): Bluebird<any> {
    return this.fetch(path, true, createOptions(body, 'PUT')).then(
      deserializeJson
    )
  }
}
