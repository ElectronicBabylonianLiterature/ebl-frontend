import Promise from 'bluebird'
import cancellableFetch from './cancellableFetch'

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
      'Content-Type': 'application/json; charset=utf-8'
    },
    method: method
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
      .then(body => new ApiError(body.description || response.statusText, body))
      .catch(() => new ApiError(response.statusText, {}))
  }
}

export default class ApiClient {
  private readonly auth
  private readonly errorReporter

  constructor(auth, errorReporter) {
    this.auth = auth
    this.errorReporter = errorReporter
  }

  createHeaders(authenticate, headers): Headers {
    const defaultHeaders = authenticate
      ? { Authorization: `Bearer ${this.auth.getAccessToken()}` }
      : {}
    return new Headers({
      ...defaultHeaders,
      ...headers
    })
  }

  fetch(path, authenticate, options): Promise<Response> {
    try {
      const headers = this.createHeaders(authenticate, options.headers)
      return cancellableFetch(apiUrl(path), {
        ...options,
        headers: headers
      })
        .then(async response => {
          if (response.ok) {
            return response
          } else {
            throw await ApiError.fromResponse(response)
          }
        })
        .catch(error => {
          this.errorReporter.captureException(error)
          throw error
        })
    } catch (error) {
      return Promise.reject(error)
    }
  }

  fetchJson(path, authenticate): Promise<any> {
    return this.fetch(path, authenticate, {}).then(response => response.json())
  }

  fetchBlob(path: string, authenticate: boolean): Promise<Blob> {
    return this.fetch(path, authenticate, {}).then(response => response.blob())
  }

  postJson(path, body): Promise<any> {
    return this.fetch(path, true, createOptions(body, 'POST')).then(
      deserializeJson
    )
  }

  putJson(path, body): Promise<any> {
    return this.fetch(path, true, createOptions(body, 'PUT')).then(
      deserializeJson
    )
  }
}
