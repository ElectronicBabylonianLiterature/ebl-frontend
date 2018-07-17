function apiUrl (path) {
  return `${process.env.REACT_APP_DICTIONARY_API_URL}${path}`
}

class ApiClient {
  constructor (auth) {
    this.auth = auth
  }

  get baseHeaders () {
    return {'Authorization': `Bearer ${this.auth.getAccessToken()}`}
  }

  async fetch (path) {
    const headers = new Headers(this.baseHeaders)
    const response = await fetch(apiUrl(path), {headers: headers})

    if (response.ok) {
      return response
    } else {
      throw Error(response.statusText)
    }
  }

  async fetchJson (path) {
    return (await this.fetch(path)).json()
  }

  async fetchBlob (path) {
    return (await this.fetch(path)).blob()
  }

  async postJson (path, body) {
    const headers = new Headers({
      ...this.baseHeaders,
      'Content-Type': 'application/json; charset=utf-8'
    })
    const response = await fetch(apiUrl(path), {body: JSON.stringify(body), headers: headers, method: 'POST'})

    if (!response.ok) {
      throw Error(response.statusText)
    }
  }
}

export default ApiClient
