import Promise from 'bluebird'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { ExtantLines } from 'corpus/domain/extant-lines'
import Word from 'dictionary/domain/Word'
import { museumNumberToString } from 'fragmentarium/domain/MuseumNumber'
import FragmentDto from 'fragmentarium/domain/FragmentDtos'
import { stringify } from 'query-string'
import { WordQuery } from 'dictionary/application/WordService'

type Dto = Record<string, unknown>

class Expectation {
  method: 'POST' | 'GET' = 'GET'
  path = ''
  authenticate: boolean | undefined = false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any = {}
  verify = false
  called = false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any = null
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
          entry.method === 'GET' && entry.path === path && !entry.isBlob,
      )
      return expectation
        ? Promise.resolve(expectation.response)
        : Promise.reject(
            new Error(
              `Unexpected ${
                authenticate ? 'authenticated' : 'not-authenticated'
              } fetchJson: ${path}`,
            ),
          )
    }),

    postJson: jest.fn().mockImplementation((path) => {
      const expectation = this.expectations.find(
        (entry) =>
          entry.method === 'POST' && entry.path === path && !entry.isBlob,
      )
      return expectation
        ? Promise.resolve(expectation.response)
        : Promise.reject(new Error(`Unexpected postJson: ${path}`))
    }),

    fetchBlob: jest.fn().mockImplementation((path, authenticate) => {
      const expectation = this.expectations.find(
        (entry) =>
          entry.method === 'GET' && entry.path === path && entry.isBlob,
      )
      return expectation
        ? Promise.resolve(expectation.response)
        : Promise.reject(
            new Error(
              `Unexpected ${
                authenticate ? 'authenticated' : 'not-authenticated'
              } fetchBlob: ${path}`,
            ),
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
      }),
    )
    return this
  }

  allowText(text: Dto): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: createTextUrl(text),
        authenticate: false,
        response: text,
      }),
    )
    return this
  }

  allowChapter(chapter: ChapterId): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `${createChapterUrl(chapter)}`,
        authenticate: false,
        response: chapter,
      }),
    )
    return this
  }

  expectText(text: Dto): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: createTextUrl(text),
        authenticate: false,
        response: text,
        verify: true,
      }),
    )
    return this
  }

  expectChapter(chapter: ChapterId): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `${createChapterUrl(chapter)}`,
        authenticate: false,
        response: chapter,
        verify: true,
      }),
    )
    return this
  }

  expectChapterDisplay(chapter: ChapterDisplay): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `${createChapterUrl(chapter.id)}/display`,
        authenticate: false,
        response: {
          id: chapter.id,
          textHasDoi: chapter.textHasDoi,
          textName: chapter.textName,
          isSingleStage: chapter.isSingleStage,
          title: chapter.title,
          lines: chapter.lines,
          record: chapter.record,
        },
        verify: true,
      }),
    )
    return this
  }

  expectLineDetails(id: ChapterId, line: number, lineDetails: Dto): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `${createChapterUrl(id)}/lines/${line}`,
        authenticate: false,
        response: lineDetails,
        verify: true,
      }),
    )
    return this
  }

  expectManuscripts(id: ChapterId, manuscriptsDto: Dto[]): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `${createChapterUrl(id)}/manuscripts`,
        authenticate: false,
        response: manuscriptsDto,
        verify: true,
      }),
    )
    return this
  }

  expectExtantLines(id: ChapterId, extantLines: ExtantLines): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `${createChapterUrl(id)}/extant_lines`,
        authenticate: false,
        response: extantLines,
        verify: true,
      }),
    )
    return this
  }

  expectUpdateManuscripts(chapter: ChapterId, manuscripts: Dto): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'POST',
        path: `${createChapterUrl(chapter)}/manuscripts`,
        authenticate: true,
        response: chapter,
        verify: true,
        body: manuscripts,
      }),
    )
    return this
  }

  expectUpdateLines(chapter: ChapterId, lines: Dto): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'POST',
        path: `${createChapterUrl(chapter)}/lines`,
        authenticate: true,
        response: chapter,
        verify: true,
        body: lines,
      }),
    )
    return this
  }

  expectImportChapter(chapter: ChapterId, atf: string): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'POST',
        path: `${createChapterUrl(chapter)}/import`,
        authenticate: false,
        response: chapter,
        verify: true,
        body: { atf },
      }),
    )
    return this
  }

  expectAnnotations(number: string, annotationDtos: readonly Dto[]): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/fragments/${number}/annotations?generateAnnotations=false`,
        authenticate: false,
        response: { annotations: annotationDtos },
        verify: true,
      }),
    )
    return this
  }

  expectUpdateAnnotations(
    number: string,
    annotationDtos: readonly Dto[],
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
      }),
    )
    return this
  }

  expectFragment(fragmentDto: FragmentDto): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/fragments/${museumNumberToString(fragmentDto.museumNumber)}`,
        authenticate: false,
        response: fragmentDto,
        verify: true,
      }),
    )
    return this
  }

  expectPhoto(
    number: string,
    photo: { blobParts: string[]; options: { type: string } },
  ): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/fragments/${number}/photo`,
        response: photo,
        authenticate: false,
        isBlob: true,
        verify: true,
      }),
    )
    return this
  }

  expectSearchWords(query: WordQuery, words: readonly Word[]): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/words?query=${encodeURIComponent(
          stringify(query, { skipEmptyString: true }),
        )}`,
        response: words,
        authenticate: false,
        verify: true,
      }),
    )
    return this
  }

  expectWord(word: Word): FakeApi {
    this.expectations.push(
      new Expectation({
        method: 'GET',
        path: `/words/${encodeURIComponent(word._id)}`,
        response: word,
        authenticate: false,
        verify: true,
      }),
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
      }),
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
      }),
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
      }),
    )
    return this
  }

  verifyExpectations(): void {
    const methods = {
      GET: (expectation: Expectation): void => {
        expect(
          expectation.isBlob ? this.client.fetchBlob : this.client.fetchJson,
        ).toHaveBeenCalledWith(expectation.path, expect.anything())
      },
      POST: (expectation: Expectation): void =>
        expect(this.client.postJson).toHaveBeenCalledWith(
          expectation.path,
          expectation.body || expect.anything(),
        ),
    }
    this.expectations
      .filter((expectation) => expectation.verify)
      .forEach((expectation) => methods[expectation.method](expectation))
  }
}
function createTextUrl(id): string {
  return `/texts/${id.genre}/${id.category}/${id.index}`
}

function createChapterUrl(id): string {
  return `${createTextUrl(id.textId)}/chapters/${encodeURIComponent(
    id.stage,
  )}/${encodeURIComponent(id.name)}`
}
