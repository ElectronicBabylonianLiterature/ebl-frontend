import _ from 'lodash'
import {
  createLineLemmatization,
  LemmaSuggestionsDto,
  LemmaWordQuery,
  LineLemmaSource,
  maximumWordsPerSuggestionRequest,
  wordNotFoundMessage,
} from 'corpus/application/edit-lite/lineLemmatization'
import CorpusLemmatizationFactory from 'corpus/application/CorpusLemmatizationFactory'
import {
  createLine,
  createManuscriptLine,
  createVariant,
  Line,
} from 'corpus/domain/line'
import { createChapter } from 'corpus/domain/text'
import Word from 'dictionary/domain/Word'
import { wordFactory } from 'test-support/word-fixtures'
import Lemma from 'transliteration/domain/Lemma'
import { Token } from 'transliteration/domain/token'

function buildWord(id: string): Word {
  return wordFactory.build({ _id: id })
}

function wordToken(
  value: string,
  normalized: boolean,
  uniqueLemma: readonly string[] = [],
): Token {
  return {
    type: normalized ? 'AkkadianWord' : 'Word',
    value: `${value}#`,
    cleanValue: value,
    parts: [],
    uniqueLemma,
    normalized,
    language: 'AKKADIAN',
    lemmatizable: true,
    alignable: true,
    erasure: 'NONE',
    alignment: null,
    variant: null,
    enclosureType: [],
    hasVariantAlignment: false,
    hasOmittedAlignment: false,
  } as Token
}

const shift = { type: 'LanguageShift', value: '%n', cleanValue: '%n' } as Token
const broken = { type: 'UnknownNumberOfSigns', value: '...' } as Token
const words: readonly Word[] = ['aklu I', 'bēlu I', 'šarru I', 'šarru II'].map(
  buildWord,
)
const [aklu, belu, sharru, otherSharru] = words
const suggestions: readonly LemmaSuggestionsDto[] = [
  { word: 'šarru', isNormalized: true, lemmas: [[sharru], [otherSharru]] },
  { word: 'šarru', isNormalized: false, lemmas: [[otherSharru]] },
  { word: 'bēlu', isNormalized: true, lemmas: [[belu, aklu]] },
  { word: 'ina', isNormalized: true, lemmas: [] },
]
const line: Line = createLine({
  number: '1',
  variants: [
    createVariant({
      reconstruction: '%n šarru bēlu ina aklu šarru',
      reconstructionTokens: [
        shift,
        wordToken('šarru', true),
        wordToken('bēlu', true),
        wordToken('ina', true),
        wordToken('aklu', true, ['aklu I']),
        wordToken('šarru', true),
      ],
      manuscripts: [
        createManuscriptLine({
          manuscriptId: 1,
          atf: 'šar-ru be-lu ...',
          atfTokens: [
            wordToken('šar-ru', false, ['šarru I', 'šarru II']),
            wordToken('be-lu', false),
            broken,
          ],
        }),
        createManuscriptLine({ manuscriptId: 2 }),
      ],
    }),
    createVariant({
      reconstruction: 'šarru',
      reconstructionTokens: [wordToken('šarru', false)],
      manuscripts: [
        createManuscriptLine({
          manuscriptId: 1,
          atf: 'ak-lu',
          atfTokens: [wordToken('ak-lu', false, ['aklu I'])],
        }),
      ],
    }),
  ],
})

function findSuggestions(
  queries: readonly LemmaWordQuery[],
): LemmaSuggestionsDto[] {
  return queries.map(
    (query) =>
      suggestions.find((suggestion) => _.isMatch(suggestion, query)) ?? {
        ...query,
        lemmas: [],
      },
  )
}

function createSource(): jest.Mocked<LineLemmaSource> {
  return {
    findSuggestions: jest.fn((queries) =>
      Promise.resolve(findSuggestions(queries)),
    ),
    findWords: jest.fn((ids) =>
      Promise.resolve(words.filter((word) => ids.includes(word._id))),
    ),
  }
}

function createClassicFactory(): CorpusLemmatizationFactory {
  return new CorpusLemmatizationFactory(
    {
      findSuggestions: (word: string, isNormalized: boolean) =>
        Promise.resolve(
          findSuggestions([{ word, isNormalized }])[0].lemmas.map((lemma) =>
            lemma.map((dictionaryWord) => new Lemma(dictionaryWord)),
          ),
        ),
    },
    {
      find: (id: string) =>
        Promise.resolve(words.find((word) => word._id === id) as Word),
    },
  )
}

it('gives what the classic factory gives for the line', async () => {
  const [expected] = await createClassicFactory().createLemmatization(
    createChapter({ lines: [line] }),
  )

  const lemmatization = await createLineLemmatization(line, createSource())

  expect(lemmatization).toEqual(expected)
  expect(lemmatization[0][0][2]).toMatchObject({
    value: 'bēlu#',
    uniqueLemma: [new Lemma(belu), new Lemma(aklu)],
    suggested: true,
  })
  expect(lemmatization[0][0][1]).toMatchObject({
    uniqueLemma: [],
    suggestions: [[new Lemma(sharru)], [new Lemma(otherSharru)]],
    suggested: false,
  })
  expect(lemmatization[0][1][0][1]).toMatchObject({
    uniqueLemma: [],
    suggestions: [],
  })
})

it('asks once for the distinct words that need suggestions and once for all lemmas', async () => {
  const source = createSource()

  await createLineLemmatization(line, source)

  expect(source.findSuggestions.mock.calls).toEqual([
    [
      [
        { word: 'šarru', isNormalized: true },
        { word: 'bēlu', isNormalized: true },
        { word: 'ina', isNormalized: true },
        { word: 'šarru', isNormalized: false },
      ],
    ],
  ])
  expect(source.findWords.mock.calls).toEqual([
    [['aklu I', 'šarru I', 'šarru II']],
  ])
})

it('asks for nothing when the line has no words', async () => {
  const source = createSource()
  const emptyLine = createLine({
    variants: [createVariant({ reconstructionTokens: [shift] })],
  })

  await expect(createLineLemmatization(emptyLine, source)).resolves.toEqual([
    [[expect.objectContaining({ value: '%n', lemmatizable: false })], []],
  ])
  expect(source.findSuggestions).not.toHaveBeenCalled()
  expect(source.findWords).not.toHaveBeenCalled()
})

it('treats a word without an answer as a word without suggestions', async () => {
  const source = createSource()
  source.findSuggestions.mockResolvedValue([])

  const lemmatization = await createLineLemmatization(line, source)

  expect(lemmatization[0][0][2]).toMatchObject({
    uniqueLemma: [],
    suggestions: [],
    suggested: false,
  })
})

it('splits more words than one request may carry', async () => {
  const source = createSource()
  const wordCount = maximumWordsPerSuggestionRequest + 1
  const longLine = createLine({
    variants: [
      createVariant({
        reconstructionTokens: _.range(wordCount).map((index) =>
          wordToken(`word${index}`, true),
        ),
      }),
    ],
  })

  await createLineLemmatization(longLine, source)

  expect(maximumWordsPerSuggestionRequest).toBe(200)
  expect(
    source.findSuggestions.mock.calls.map(([queries]) => queries.length),
  ).toEqual([200, 1])
})

it('rejects when a lemma of the line is not in the dictionary', async () => {
  const source = createSource()
  source.findWords.mockResolvedValue([sharru, otherSharru])

  await expect(createLineLemmatization(line, source)).rejects.toThrow(
    new Error(wordNotFoundMessage('aklu I')),
  )
  expect(wordNotFoundMessage('aklu I')).toBe(
    'The dictionary has no word with the id "aklu I".',
  )
})
