import { ChapterLinesOptions } from 'corpus/application/ChapterOutlineService'
import { fromLineDto } from 'corpus/application/dtos'
import { LinesPageDto } from 'corpus/application/edit-lite/chapterOutline'
import {
  chapterId,
  chapterUrl,
  createTextServiceTestContext,
} from 'corpus/application/TextService.testSupport'
import { createLine, createVariant, Line } from 'corpus/domain/line'
import Word from 'dictionary/domain/Word'
import {
  atfTokens,
  reconstructionTokens,
} from 'test-support/test-corpus-tokens'
import { wordFactory } from 'test-support/word-fixtures'
import Lemma from 'transliteration/domain/Lemma'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const { apiClient, fragmentServiceMock, wordServiceMock, textService } =
  createTextServiceTestContext()

const aklu: Word = wordFactory.build({ _id: 'aklu I' })
const kur: Word = wordFactory.build({ _id: 'kur I' })
const annotatedPage: LinesPageDto = {
  total: 1,
  offset: 0,
  limit: 1,
  lines: [
    {
      number: '1',
      isSecondLineOfParallelism: false,
      isBeginningOfSection: false,
      translation: '',
      variants: [
        {
          reconstruction: '%n kur-kur',
          reconstructionTokens,
          intertext: '',
          manuscripts: [
            {
              manuscriptId: 1,
              labels: [],
              number: '1',
              atf: 'kur ra ...',
              atfTokens,
              omittedWords: [1],
            },
          ],
        },
      ],
    },
  ],
  revision: 'revision-7',
}
const annotatedLine: Line = fromLineDto(annotatedPage.lines[0])

beforeEach(() => {
  jest.clearAllMocks()
})

describe('findChapterLines with tokens', () => {
  it('asks for the tokens and keeps them on the lines', async () => {
    apiClient.fetchJson.mockResolvedValueOnce(annotatedPage)

    const [line] = await textService.findChapterLines(
      chapterId,
      0,
      1,
      undefined,
      { revision: 'revision-7', tokens: true },
    )

    expect(apiClient.fetchJson.mock.calls).toEqual([
      [
        `${chapterUrl}/lines?offset=0&limit=1&revision=revision-7&tokens=true`,
        false,
        undefined,
      ],
    ])
    expect(line.variants[0].reconstructionTokens).toBe(reconstructionTokens)
    expect(line.variants[0].manuscripts[0].atfTokens).toBe(atfTokens)
    expect(line.variants[0].manuscripts[0].omittedWords).toEqual([1])
  })

  it.each<[ChapterLinesOptions, string]>([
    [{}, ''],
    [{ tokens: false }, ''],
    [{ tokens: true }, '&tokens=true'],
    [{ revision: 'r 1', tokens: false }, '&revision=r%201'],
  ])('asks with the options %j for the lines%s', async (options, query) => {
    apiClient.fetchJson.mockResolvedValueOnce(annotatedPage)

    await textService.findChapterLines(chapterId, 0, 1, undefined, options)

    expect(apiClient.fetchJson.mock.calls).toEqual([
      [`${chapterUrl}/lines?offset=0&limit=1${query}`, false, undefined],
    ])
  })
})

describe('findLineSuggestions', () => {
  it('asks for the suggestions of the line in one batch and for its lemmas in one request', async () => {
    apiClient.postJson.mockResolvedValueOnce([
      { word: 'kur-kur', isNormalized: true, lemmas: [[kur]] },
    ])
    wordServiceMock.findAll.mockResolvedValueOnce([aklu])

    const [[reconstruction, [manuscript]]] =
      await textService.findLineSuggestions(annotatedLine)

    expect(apiClient.postJson.mock.calls).toEqual([
      [
        '/lemmas/batch',
        { words: [{ word: 'kur-kur', isNormalized: true }] },
        false,
      ],
    ])
    expect(wordServiceMock.findAll.mock.calls).toEqual([[['aklu I']]])
    expect(apiClient.fetchJson).not.toHaveBeenCalled()
    expect(fragmentServiceMock.findSuggestions).not.toHaveBeenCalled()
    expect(wordServiceMock.find).not.toHaveBeenCalled()
    expect(reconstruction.map((token) => token.uniqueLemma)).toEqual([
      null,
      [new Lemma(kur)],
    ])
    expect(reconstruction[1].suggested).toBe(true)
    expect(manuscript.map((token) => token.uniqueLemma)).toEqual([
      [],
      [new Lemma(aklu)],
      null,
    ])
  })

  it('asks for nothing when the line has neither words nor lemmas', async () => {
    const line = createLine({ variants: [createVariant({})] })

    await expect(textService.findLineSuggestions(line)).resolves.toEqual([
      [[], []],
    ])
    expect(apiClient.postJson).not.toHaveBeenCalled()
    expect(wordServiceMock.findAll).not.toHaveBeenCalled()
  })

  it('rejects with the request error', async () => {
    const error = new Error('Request data failed validation')
    apiClient.postJson.mockRejectedValueOnce(error)
    wordServiceMock.findAll.mockResolvedValueOnce([aklu])

    await expect(textService.findLineSuggestions(annotatedLine)).rejects.toBe(
      error,
    )
  })
})

it('searches the lemmas of the dictionary', async () => {
  wordServiceMock.searchLemma.mockResolvedValueOnce([aklu])

  await expect(textService.searchDictionaryLemma('ak')).resolves.toEqual([aklu])
  expect(wordServiceMock.searchLemma.mock.calls).toEqual([['ak']])
})
