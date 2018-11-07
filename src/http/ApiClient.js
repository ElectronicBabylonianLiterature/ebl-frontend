/* global AbortController */
import Promise from 'bluebird'

function apiUrl (path) {
  return `${process.env.REACT_APP_DICTIONARY_API_URL}${path}`
}

class ApiClient {
  constructor (auth) {
    this.auth = auth
  }

  createHeaders (authenticate, headers) {
    const defaultHeaders = authenticate
      ? { 'Authorization': `Bearer ${this.auth.getAccessToken()}` }
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
      }).then(response => {
        if (response.ok) {
          resolve(response)
        } else {
          response.json()
            .then(({ title, description }) => new Error(description || title))
            .catch(() => new Error(response.statusText))
            .then(reject)
        }
      }).catch(reject)

      onCancel(function () {
        abortController.abort()
      })
    })
  }

  fetchJson (path, authenticate) {
    return this.cancellableFetch(path, authenticate, {})
      .then(response => response.json())
  }

  fetchBlob (path, authenticate) {
    return this.cancellableFetch(path, authenticate, {})
      .then(response => response.blob())
  }

  postJson (path, body) {
    return this.cancellableFetch(path, true, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      method: 'POST'
    })
  }
}

export default ApiClient
