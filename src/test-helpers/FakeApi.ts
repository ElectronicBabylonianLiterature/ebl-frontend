import Promise from 'bluebird'
import Word from 'dictionary/domain/Word'

class Expectation {
  method: 'POST' | 'GET' = 'GET'
  path = ''
  authenticate = true
  response = {}
  verify = false
  called = false
  body: object | null = null
  isBlob = false

  constructor(data) {
    Object.assign(this, data)
  }
}

export default class FakeApi {
  private expectations: Expectation[] = []

  readonly client = {
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

  expectTexts(texts): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/texts`,
        authenticate: false,
        response: texts,
        verify: true
      })
    )
    return this
  }

  allowText(text): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/texts/${text.category}/${text.index}`,
        authenticate: true,
        response: text
      })
    )
    return this
  }

  expectText(text): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/texts/${text.category}/${text.index}`,
        authenticate: true,
        response: text,
        verify: true
      })
    )
    return this
  }

  expectUpdateManuscripts(text, chapterIndex, manuscripts): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'POST',
        path: `/texts/${text.category}/${text.index}/chapters/${chapterIndex}/manuscripts`,
        response: text,
        verify: true,
        body: manuscripts
      })
    )
    return this
  }

  expectUpdateLines(text, chapterIndex, lines): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'POST',
        path: `/texts/${text.category}/${text.index}/chapters/${chapterIndex}/lines`,
        response: text,
        verify: true,
        body: lines
      })
    )
    return this
  }

  expectAnnotations(
    number: string,
    annotationDtos: readonly object[]
  ): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/fragments/${number}/annotations`,
        authenticate: true,
        response: { annotations: annotationDtos },
        verify: true
      })
    )
    return this
  }

  expectUpdateAnnotations(
    number: string,
    annotationDtos: readonly object[]
  ): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'POST',
        path: `/fragments/${number}/annotations`,
        body: {
          fragmentNumber: number,
          annotations: annotationDtos
        },
        authenticate: true,
        response: { annotations: annotationDtos },
        verify: true
      })
    )
    return this
  }

  expectFragment(fragmentDto): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/fragments/${fragmentDto._id}`,
        authenticate: true,
        response: fragmentDto,
        verify: true
      })
    )
    return this
  }

  expectPhoto(number: string): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/fragments/${number}/photo`,
        authenticate: true,
        isBlob: true,
        verify: true
      })
    )
    return this
  }

  expectSearchWords(query: string, words: readonly Word[]): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/words?query=${encodeURIComponent(query)}`,
        response: words,
        authenticate: true,
        verify: true
      })
    )
    return this
  }

  expectWord(word: Word): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/words/${encodeURIComponent(word._id)}`,
        response: word,
        authenticate: true,
        verify: true
      })
    )
    return this
  }

  expectUpdateWord(word: Word): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'POST',
        path: `/words/${encodeURIComponent(word._id)}`,
        body: word,
        response: word,
        authenticate: true,
        verify: true
      })
    )
    return this
  }

  allowStatistics(statistics): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/statistics`,
        authenticate: false,
        response: statistics
      })
    )
    return this
  }

  allowImage(file): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/images/${file}`,
        authenticate: false,
        isBlob: true
      })
    )
    return this
  }

  verifyExpectations(): void {
    const methods = {
      GET: (expectation: Expectation): void =>
        expect(
          expectation.isBlob ? this.client.fetchBlob : this.client.fetchJson
        ).toHaveBeenCalledWith(expectation.path, expectation.authenticate),
      POST: (expectation: Expectation): void =>
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
