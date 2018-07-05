function apiUrl (path) {
  return `${process.env.REACT_APP_DICTIONARY_API_URL}${path}`
}

class HttpClient {
  constructor (auth) {
    this.auth = auth
  }

  async fetchJson (path) {
    const headers = new Headers({'Authorization': `Bearer ${this.auth.getAccessToken()}`})
    const response = await fetch(apiUrl(path), {headers: headers})

    if (response.ok) {
      return response.json()
    } else {
      throw Error(response.statusText)
    }
  }

  async postJson (path, body) {
    const headers = new Headers({
      'Authorization': `Bearer ${this.auth.getAccessToken()}`,
      'Content-Type': 'application/json; charset=utf-8'
    })
    const response = await fetch(apiUrl(path), {body: JSON.stringify(body), headers: headers, method: 'POST'})

    if (!response.ok) {
      throw Error(response.statusText)
    }
  }
}

export default HttpClient
