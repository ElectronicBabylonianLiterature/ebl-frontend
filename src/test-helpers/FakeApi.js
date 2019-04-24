import Promise from 'bluebird'
import { Record, List } from 'immutable'

const Expectation = Record({
  method: 'GET',
  path: '',
  authenticate: true,
  response: {},
  verify: false,
  called: false,
  body: null
})

export default class FakeApi {
  expectations = List()

  client = {
    fetchJson: jest.fn().mockImplementation((path, authenticate) => {
      const expectation = this.expectations.find(entry => entry.method === 'GET' && entry.path === path && entry.authenticate === authenticate)
      return expectation
        ? Promise.resolve(expectation.response)
        : Promise.reject(new Error(`Unexpected ${authenticate ? 'authenticated' : 'not-authenticated'} fetchJson: ${path}`))
    }),

    postJson: jest.fn().mockImplementation(path => {
      const expectation = this.expectations.find(entry => entry.method === 'POST' && entry.path === path)
      return expectation
        ? Promise.resolve(expectation.response)
        : Promise.reject(new Error(`Unexpected postJson: ${path}`))
    }),

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
      verify: true,
      body: text
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
    const methods = {
      'GET': expectation => expect(this.client.fetchJson).toHaveBeenCalledWith(expectation.path, expectation.authenticate),
      'POST': expectation => expect(this.client.postJson).toHaveBeenCalledWith(expectation.path, expectation.body || expect.anything())
    }
    this.expectations
      .filter(expectation => expectation.verify)
      .forEach(expectation => methods[expectation.method](expectation))
  }
}
