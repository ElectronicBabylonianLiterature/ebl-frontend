import Bluebird from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import TextService from './TextService'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'
import Lemma from 'transliteration/domain/Lemma'
import { text, textDto } from 'test-support/test-corpus-text'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import Word from 'dictionary/domain/Word'
import ApiClient from 'http/ApiClient'

jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()
const MockFragmentService = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>
const fragmentServiceMock = new MockFragmentService()
const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()
const testService = new TextService(
  apiClient,
  fragmentServiceMock,
  wordServiceMock
)

const alignmentDto = {
  alignment: [
    [
      [
        {
          alignment: [
            {
              value: 'kur',
              alignment: null,
              variant: '',
              language: '',
              isNormalized: false,
            },
            {
              value: 'ra',
              alignment: 1,
              variant: 'ra',
              language: 'AKKADIAN',
              isNormalized: true,
            },
            {
              value: '...',
            },
          ],
          omittedWords: [],
        },
      ],
    ],
  ],
}

const word: Word = {
  _id: 'aklu I',
  pos: [],
  lemma: ['aklu'],
  homonym: 'I',
  guideWord: '',
  oraccWords: [],
}

const lemmatization = [
  [
    [
      [
        new LemmatizationToken('%n', false, null, null),
        new LemmatizationToken('kur-kur', true, [], []),
      ],
      [
        [
          new LemmatizationToken('kur', true, [], []),
          new LemmatizationToken('ra', true, [new Lemma(word)], []),
          new LemmatizationToken('...', false, null, null),
        ],
      ],
    ],
  ],
]

const lemmatizationDto = {
  lemmatization: [
    [
      {
        reconstruction: [
          {
            value: '%n',
          },
          {
            value: 'kur-kur',
            uniqueLemma: [],
          },
        ],
        manuscripts: [
          [
            {
              value: 'kur',
              uniqueLemma: [],
            },
            {
              value: 'ra',
              uniqueLemma: ['aklu I'],
            },
            {
              value: '...',
            },
          ],
        ],
      },
    ],
  ],
}

const manuscriptsDto = {
  manuscripts: [
    {
      id: 1,
      siglumDisambiguator: '1',
      museumNumber: 'BM.X',
      accession: 'X.1',
      periodModifier: 'Early',
      period: 'Ur III',
      provenance: 'Nippur',
      type: 'School',
      notes: 'a note',
      references: [
        {
          id: 'RN1853',
          linesCited: [],
          notes: '',
          pages: '34-54',
          type: 'DISCUSSION',
        },
      ],
    },
  ],
}

const linesDto = {
  lines: [
    {
      number: '1',
      isBeginningOfSection: true,
      isSecondLineOfParallelism: true,
      variants: [
        {
          reconstruction: '%n kur-kur',
          manuscripts: [
            {
              manuscriptId: 1,
              labels: ['o', 'iii'],
              number: 'a+1',
              atf: 'kur ra',
              omittedWords: [],
            },
          ],
        },
      ],
    },
  ],
}

const textsDto = [
  {
    category: 1,
    index: 1,
    name: 'Palm and Vine',
    numberOfVerses: 10,
    approximateVerses: true,
  },
]

const testData: TestData[] = [
  [
    'find',
    [text.category, text.index],
    apiClient.fetchJson,
    text,
    [
      `/texts/${encodeURIComponent(text.category)}/${encodeURIComponent(
        text.index
      )}`,
      true,
    ],
    Bluebird.resolve(textDto),
  ],
  [
    'list',
    [],
    apiClient.fetchJson,
    textsDto,
    ['/texts', false],
    Bluebird.resolve(textsDto),
  ],
  [
    'updateAlignment',
    [text.category, text.index, 0, text.chapters[0].alignment],
    apiClient.postJson,
    text,
    [
      `/texts/${encodeURIComponent(text.category)}/${encodeURIComponent(
        text.index
      )}/chapters/0/alignment`,
      alignmentDto,
    ],
    Bluebird.resolve(textDto),
  ],
  [
    'updateLemmatization',
    [text.category, text.index, 0, lemmatization],
    apiClient.postJson,
    text,
    [
      `/texts/${encodeURIComponent(text.category)}/${encodeURIComponent(
        text.index
      )}/chapters/0/lemmatization`,
      lemmatizationDto,
    ],
    Bluebird.resolve(textDto),
  ],
  [
    'updateManuscripts',
    [text.category, text.index, 0, text.chapters[0].manuscripts],
    apiClient.postJson,
    text,
    [
      `/texts/${encodeURIComponent(text.category)}/${encodeURIComponent(
        text.index
      )}/chapters/0/manuscripts`,
      manuscriptsDto,
    ],
    Bluebird.resolve(textDto),
  ],
  [
    'updateLines',
    [text.category, text.index, 0, text.chapters[0].lines],
    apiClient.postJson,
    text,
    [
      `/texts/${encodeURIComponent(text.category)}/${encodeURIComponent(
        text.index
      )}/chapters/0/lines`,
      linesDto,
    ],
    Bluebird.resolve(textDto),
  ],
]

describe('TextService', () => testDelegation(testService, testData))

test('findSuggestions', async () => {
  wordServiceMock.find.mockReturnValue(Bluebird.resolve(word))
  fragmentServiceMock.findSuggestions.mockReturnValue(Bluebird.resolve([]))
  await expect(testService.findSuggestions(text.chapters[0])).resolves.toEqual(
    lemmatization
  )
})
