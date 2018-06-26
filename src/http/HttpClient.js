class HttpClient {
  constructor (auth) {
    this.auth = auth
  }

  async fetchJson (url) {
    const headers = new Headers({'Authorization': `Bearer ${this.auth.getAccessToken()}`})
    const response = await fetch(url, {headers: headers})

    if (response.ok) {
      return response.json()
    } else {
      throw Error(response.statusText)
    }
  }

  async postJson (url, body) {
    const headers = new Headers({
      'Authorization': `Bearer ${this.auth.getAccessToken()}`,
      'Content-Type': 'application/json; charset=utf-8'
    })
    const response = await fetch(url, {body: JSON.stringify(body), headers: headers})

    if (!response.ok) {
      throw Error(response.statusText)
    }
  }
}

export default HttpClient
