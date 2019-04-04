import Promise from 'bluebird'
import { Record, List } from 'immutable'

const Expectation = Record({ method: 'GET', path: '', authenticate: true, response: {}, verify: false, called: false })
export default class FakeApi {
  expectations = List()

  client = {
    fetchJson: (path, authenticate) => {
      const expectationIndex = this.expectations.findIndex(entry => entry.method === 'GET' && entry.path === path && entry.authenticate === authenticate)
      if (expectationIndex >= 0) {
        const expectation = this.expectations.get(expectationIndex)
        this.expectations = this.expectations.setIn([expectationIndex, 'called'], true)
        return Promise.resolve(expectation.response)
      } else {
        return Promise.reject(new Error(`Unexpected ${authenticate ? 'authenticated' : 'not-authenticated'} fetchJson: ${path}`))
      }
    },

    postJson: (path, authenticate) => {
      const expectationIndex = this.expectations.findIndex(entry => entry.method === 'POST' && entry.path === path)
      if (expectationIndex >= 0) {
        const expectation = this.expectations.get(expectationIndex)
        this.expectations = this.expectations.setIn([expectationIndex, 'called'], true)
        return Promise.resolve(expectation.response)
      } else {
        return Promise.reject(new Error(`Unexpected ${authenticate ? 'authenticated' : 'not-authenticated'} postJson: ${path}`))
      }
    },

    fetchBlob: (path, authenticate) => {
      return Promise.reject(new Error(`Unexpected ${authenticate ? 'authenticated' : 'not-authenticated'} fetchBlob: ${path}`))
    }
  }

  allowText (text) {
    this.expectations = this.expectations.push(Expectation({
      method: 'GET',
      path: `/texts/${text.category}/${text.index}`,
      authenticate: true,
      response: text
    }))
    return this
  }

  expectText (text) {
    this.expectations = this.expectations.push(Expectation({
      method: 'GET',
      path: `/texts/${text.category}/${text.index}`,
      authenticate: true,
      response: text,
      verify: true
    }))
    return this
  }

  expectUpdateText (text) {
    this.expectations = this.expectations.push(Expectation({
      method: 'POST',
      path: `/texts/${text.category}/${text.index}`,
      response: text,
      verify: true
    }))
    return this
  }

  allowStatistics (statistics) {
    this.expectations.push(Expectation({
      method: 'GET',
      path: `/statistics`,
      authenticate: false,
      response: statistics
    }))
    return this
  }

  verifyExpectations () {
    return this.expectations.filter(request => request.verify && !request.called)
  }
}
