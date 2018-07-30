function apiUrl (path) {
  return `${process.env.REACT_APP_DICTIONARY_API_URL}${path}`
}

class ApiClient {
  constructor (auth) {
    this.auth = auth
  }

  createHeaders (authenticate, headers) {
    const defaultHeaders = authenticate
      ? {'Authorization': `Bearer ${this.auth.getAccessToken()}`}
      : {}
    return new Headers({
      ...defaultHeaders,
      ...headers
    })
  }

  async fetch (path, authenticate, signal) {
    const headers = this.createHeaders(authenticate, {})
    const response = await fetch(apiUrl(path), {
      headers: headers,
      signal: signal
    })

    if (response.ok) {
      return response
    } else {
      throw Error(response.statusText)
    }
  }

  async fetchJson (path, authenticate, signal) {
    return (await this.fetch(path, authenticate, signal)).json()
  }

  async fetchBlob (path, authenticate, signal) {
    return (await this.fetch(path, authenticate, signal)).blob()
  }

  async postJson (path, body, signal) {
    const headers = this.createHeaders(true, {
      'Content-Type': 'application/json; charset=utf-8'
    })
    const response = await fetch(apiUrl(path), {
      body: JSON.stringify(body),
      headers: headers,
      method: 'POST',
      signal: signal
    })

    if (!response.ok) {
      throw Error(response.statusText)
    }
  }

  isNotAbortError (error) {
    return error.name !== 'AbortError'
  }
}

export default ApiClient
