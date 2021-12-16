import Promise from 'bluebird'
import { ChapterId } from 'corpus/domain/chapter'
import { ExtantLines } from 'corpus/domain/extant-lines'
import Word from 'dictionary/domain/Word'
import MuseumNumber, {
  museumNumberToString,
} from 'fragmentarium/domain/MuseumNumber'

type Dto = Record<string, unknown>

class Expectation {
  method: 'POST' | 'GET' = 'GET'
  path = ''
  authenticate = true
  response: Dto | readonly Dto[] = {}
  verify = false
  called = false
  body: Dto | null = null
  isBlob = false

  constructor(data: Partial<Expectation>) {
    Object.assign(this, data)
  }
}

export default class FakeApi {
  private expectations: Expectation[] = []

  readonly client = {
    fetchJson: jest.fn().mockImplementation((path, authenticate) => {
      const expectation = this.expectations.find(
        (entry) =>
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

    postJson: jest.fn().mockImplementation((path) => {
      const expectation = this.expectations.find(
        (entry) =>
          entry.method === 'POST' && entry.path === path && !entry.isBlob
      )
      return expectation
        ? Promise.resolve(expectation.response)
        : Promise.reject(new Error(`Unexpected postJson: ${path}`))
    }),

    fetchBlob: jest.fn().mockImplementation((path, authenticate) => {
      const expectation = this.expectations.find(
        (entry) =>
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
    }),
  }

  expectTexts(texts: Dto[]): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/texts`,
        authenticate: false,
        response: texts,
        verify: true,
      })
    )
    return this
  }

  allowText(text: Dto): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/texts/${text.genre}/${text.category}/${text.index}`,
        authenticate: true,
        response: text,
      })
    )
    return this
  }

  allowChapter(chapter): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/texts/${chapter.textId.genre}/${chapter.textId.category}/${
          chapter.textId.index
        }/chapters/${encodeURIComponent(chapter.stage)}/${encodeURIComponent(
          chapter.name
        )}`,
        authenticate: true,
        response: chapter,
      })
    )
    return this
  }

  expectText(text: Dto): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/texts/${text.genre}/${text.category}/${text.index}`,
        authenticate: true,
        response: text,
        verify: true,
      })
    )
    return this
  }

  expectChapter(chapter): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/texts/${chapter.textId.genre}/${chapter.textId.category}/${
          chapter.textId.index
        }/chapters/${encodeURIComponent(chapter.stage)}/${encodeURIComponent(
          chapter.name
        )}`,
        authenticate: true,
        response: chapter,
        verify: true,
      })
    )
    return this
  }

  expectManuscripts(id: ChapterId, manuscriptsDto: Dto[]): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/texts/${id.textId.genre}/${id.textId.category}/${
          id.textId.index
        }/chapters/${encodeURIComponent(id.stage)}/${encodeURIComponent(
          id.name
        )}/manuscripts`,
        response: manuscriptsDto,
        verify: true,
      })
    )
    return this
  }

  expectExtantLines(id: ChapterId, extantLines: ExtantLines): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/texts/${id.textId.genre}/${id.textId.category}/${
          id.textId.index
        }/chapters/${encodeURIComponent(id.stage)}/${encodeURIComponent(
          id.name
        )}/extant_lines`,
        response: extantLines,
        verify: true,
      })
    )
    return this
  }

  expectUpdateManuscripts(chapter, manuscripts: Dto): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'POST',
        path: `/texts/${chapter.textId.genre}/${chapter.textId.category}/${
          chapter.textId.index
        }/chapters/${encodeURIComponent(chapter.stage)}/${encodeURIComponent(
          chapter.name
        )}/manuscripts`,
        response: chapter,
        verify: true,
        body: manuscripts,
      })
    )
    return this
  }

  expectUpdateLines(chapter, lines: Dto): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'POST',
        path: `/texts/${chapter.textId.genre}/${chapter.textId.category}/${
          chapter.textId.index
        }/chapters/${encodeURIComponent(chapter.stage)}/${encodeURIComponent(
          chapter.name
        )}/lines`,
        response: chapter,
        verify: true,
        body: lines,
      })
    )
    return this
  }

  expectImportChapter(chapter, atf: string): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'POST',
        path: `/texts/${chapter.textId.genre}/${chapter.textId.category}/${
          chapter.textId.index
        }/chapters/${encodeURIComponent(chapter.stage)}/${encodeURIComponent(
          chapter.name
        )}/import`,
        response: chapter,
        verify: true,
        body: { atf },
      })
    )
    return this
  }

  expectAnnotations(number: string, annotationDtos: readonly Dto[]): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/fragments/${number}/annotations?generateAnnotations=false`,
        authenticate: true,
        response: { annotations: annotationDtos },
        verify: true,
      })
    )
    return this
  }

  expectUpdateAnnotations(
    number: string,
    annotationDtos: readonly Dto[]
  ): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'POST',
        path: `/fragments/${number}/annotations`,
        body: {
          fragmentNumber: number,
          annotations: annotationDtos,
        },
        authenticate: true,
        response: { annotations: annotationDtos },
        verify: true,
      })
    )
    return this
  }

  expectFragment(fragmentDto: Dto & { museumNumber: MuseumNumber }): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/fragments/${museumNumberToString(fragmentDto.museumNumber)}`,
        authenticate: true,
        response: fragmentDto,
        verify: true,
      })
    )
    return this
  }

  expectPhoto(
    number: string,
    photo: { blobParts: string[]; options: { type: string } }
  ): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/fragments/${number}/photo`,
        response: photo,
        authenticate: true,
        isBlob: true,
        verify: true,
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
        verify: true,
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
        verify: true,
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
        verify: true,
      })
    )
    return this
  }

  allowStatistics(statistics: Dto): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/statistics`,
        authenticate: false,
        response: statistics,
      })
    )
    return this
  }

  allowImage(file: string): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/images/${file}`,
        authenticate: false,
        isBlob: true,
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
        ),
    }
    this.expectations
      .filter((expectation) => expectation.verify)
      .forEach((expectation) => methods[expectation.method](expectation))
  }
}
