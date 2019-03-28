import Promise from 'bluebird'

export default class FakeApi {
  gets = []
  client = {
    fetchJson: (path, authenticate) => {
      const expectation = this.gets.find(entry => entry.path === path && entry.authenticate === authenticate)
      return expectation
        ? Promise.resolve(expectation.response)
        : Promise.reject(new Error(`Unexpected ${authenticate ? 'authenticated' : 'not-authenticated'} GET request: ${path}`))
    }
  }

  expectText (text) {
    this.gets.push({
      path: `/texts/${text.category}.${text.index}`,
      authenticate: true,
      response: text
    })
    return this
  }
}
