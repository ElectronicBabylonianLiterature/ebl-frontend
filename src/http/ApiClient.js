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

  async fetch (path, authenticate) {
    const headers = this.createHeaders(authenticate, {})
    const response = await fetch(apiUrl(path), {headers: headers})

    if (response.ok) {
      return response
    } else {
      throw Error(response.statusText)
    }
  }

  async fetchJson (path, authenticate) {
    return (await this.fetch(path, authenticate)).json()
  }

  async fetchBlob (path) {
    return (await this.fetch(path, true)).blob()
  }

  async postJson (path, body) {
    const headers = this.createHeaders(true, {
      'Content-Type': 'application/json; charset=utf-8'
    })
    const response = await fetch(apiUrl(path), {body: JSON.stringify(body), headers: headers, method: 'POST'})

    if (!response.ok) {
      throw Error(response.statusText)
    }
  }
}

export default ApiClient
