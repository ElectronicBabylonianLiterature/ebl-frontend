/* global AbortController */
import Promise from 'bluebird'

function apiUrl (path) {
  return `${process.env.REACT_APP_DICTIONARY_API_URL}${path}`
}

function deserializeJson (response) {
  return [201, 204].includes(response.status) ? null : response.json()
}

function createOptions (body, method) {
  return {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    method: method
  }
}
export class ApiError extends Error {
  constructor (message, data) {
    super(message)
    this.name = this.constructor.name
    this.data = data
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = new Error(message).stack
    }
  }

  static async fromResponse (response) {
    return response
      .json()
      .then(body => new ApiError(body.description || response.statusText, body))
      .catch(() => new ApiError(response.statusText, {}))
  }
}

export default class ApiClient {
  constructor (auth, errorReporter) {
    this.auth = auth
    this.errorReporter = errorReporter
  }

  createHeaders (authenticate, headers) {
    const defaultHeaders = authenticate
      ? { Authorization: `Bearer ${this.auth.getAccessToken()}` }
      : {}
    return new Headers({
      ...defaultHeaders,
      ...headers
    })
  }

  cancellableFetch (path, authenticate, options) {
    return new Promise((resolve, reject, onCancel) => {
      const headers = this.createHeaders(authenticate, options.headers)
      const abortController = new AbortController()
      fetch(apiUrl(path), {
        ...options,
        headers: headers,
        signal: abortController.signal
      })
        .then(async response => {
          if (response.ok) {
            resolve(response)
          } else {
            return ApiError.fromResponse(response).then(error => {
              throw error
            })
          }
        })
        .catch(error => {
          this.errorReporter.captureException(error)
          reject(error)
        })

      onCancel(function () {
        abortController.abort()
      })
    })
  }

  fetchJson (path, authenticate) {
    return this.cancellableFetch(path, authenticate, {}).then(response =>
      response.json()
    )
  }

  fetchBlob (path, authenticate) {
    return this.cancellableFetch(path, authenticate, {}).then(response =>
      response.blob()
    )
  }

  postJson (path, body) {
    return this.cancellableFetch(path, true, createOptions(body, 'POST')).then(
      deserializeJson
    )
  }

  putJson (path, body) {
    return this.cancellableFetch(path, true, createOptions(body, 'PUT')).then(
      deserializeJson
    )
  }
}
