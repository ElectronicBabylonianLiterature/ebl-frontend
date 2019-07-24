import Promise from 'bluebird'
import { Record, List } from 'immutable'

const Expectation = Record({
  method: 'GET',
  path: '',
  authenticate: true,
  response: {},
  verify: false,
  called: false,
  body: null,
  isBlob: false
})

export default class FakeApi {
  expectations = List()

  client = {
    fetchJson: jest.fn().mockImplementation((path, authenticate) => {
      const expectation = this.expectations.find(
        entry =>
          entry.method === 'GET' &&
          entry.path === path &&
          entry.authenticate === authenticate &&
          !entry.isBlob
      )
      return expectation
        ? Promise.resolve(expectation.response)
        : Promise.reject(
            new Error(
              `Unexpected ${
                authenticate ? 'authenticated' : 'not-authenticated'
              } fetchJson: ${path}`
            )
          )
    }),

    postJson: jest.fn().mockImplementation(path => {
      const expectation = this.expectations.find(
        entry => entry.method === 'POST' && entry.path === path && !entry.isBlob
      )
      return expectation
        ? Promise.resolve(expectation.response)
        : Promise.reject(new Error(`Unexpected postJson: ${path}`))
    }),

    fetchBlob: jest.fn().mockImplementation((path, authenticate) => {
      const expectation = this.expectations.find(
        entry =>
          entry.method === 'GET' &&
          entry.path === path &&
          entry.authenticate === authenticate &&
          entry.isBlob
      )
      return expectation
        ? Promise.resolve(expectation.response)
        : Promise.reject(
            new Error(
              `Unexpected ${
                authenticate ? 'authenticated' : 'not-authenticated'
              } fetchBlob: ${path}`
            )
          )
    })
  }

  expectTexts(texts) {
    this.expectations = this.expectations.push(
      Expectation({
        method: 'GET',
        path: `/texts`,
        authenticate: false,
        response: texts,
        verify: true
      })
    )
    return this
  }

  allowText(text) {
    this.expectations = this.expectations.push(
      Expectation({
        method: 'GET',
        path: `/texts/${text.category}/${text.index}`,
        authenticate: true,
        response: text
      })
    )
    return this
  }

  expectText(text) {
    this.expectations = this.expectations.push(
      Expectation({
        method: 'GET',
        path: `/texts/${text.category}/${text.index}`,
        authenticate: true,
        response: text,
        verify: true
      })
    )
    return this
  }

  expectUpdateManuscripts(text, chapterIndex, manuscripts) {
    this.expectations = this.expectations.push(
      Expectation({
        method: 'POST',
        path: `/texts/${text.category}/${text.index}/chapters/${chapterIndex}/manuscripts`,
        response: text,
        verify: true,
        body: manuscripts
      })
    )
    return this
  }

  expectUpdateLines(text, chapterIndex, lines) {
    this.expectations = this.expectations.push(
      Expectation({
        method: 'POST',
        path: `/texts/${text.category}/${text.index}/chapters/${chapterIndex}/lines`,
        response: text,
        verify: true,
        body: lines
      })
    )
    return this
  }

  allowStatistics(statistics) {
    this.expectations = this.expectations.push(
      Expectation({
        method: 'GET',
        path: `/statistics`,
        authenticate: false,
        response: statistics
      })
    )
    return this
  }

  allowImage(file) {
    this.expectations = this.expectations.push(
      Expectation({
        method: 'GET',
        path: `/images/${file}`,
        authenticate: false,
        isBlob: true
      })
    )
    return this
  }

  verifyExpectations() {
    const methods = {
      GET: expectation =>
        expect(
          expectation.isBlob ? this.client.fetchBlob : this.client.fetchJson
        ).toHaveBeenCalledWith(expectation.path, expectation.authenticate),
      POST: expectation =>
        expect(this.client.postJson).toHaveBeenCalledWith(
          expectation.path,
          expectation.body || expect.anything()
        )
    }
    this.expectations
      .filter(expectation => expectation.verify)
      .forEach(expectation => methods[expectation.method](expectation))
  }
}
