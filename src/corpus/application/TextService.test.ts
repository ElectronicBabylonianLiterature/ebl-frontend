import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import TextService from './TextService'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'
import Lemma from 'transliteration/domain/Lemma'
import { text, textDto } from 'test-support/test-corpus-text'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import Word from 'dictionary/domain/Word'

jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')

const apiClient = {
  fetchJson: jest.fn(),
  postJson: jest.fn(),
}
const MockFragmentService = FragmentService as jest.Mock<FragmentService>
const fragmentServiceMock = new MockFragmentService()
const MockWordService = WordService as jest.Mock<WordService>
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
              alignment: 1,
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
    Promise.resolve(textDto),
  ],
  [
    'list',
    [],
    apiClient.fetchJson,
    textsDto,
    ['/texts', false],
    Promise.resolve(textsDto),
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
    Promise.resolve(textDto),
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
    Promise.resolve(textDto),
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
    Promise.resolve(textDto),
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
    Promise.resolve(textDto),
  ],
]

describe('TextService', () => testDelegation(testService, testData))

test('findSuggestions', async () => {
  ;(wordServiceMock.find as jest.Mock).mockReturnValue(Promise.resolve(word))
  ;(fragmentServiceMock.findSuggestions as jest.Mock).mockReturnValue(
    Promise.resolve([])
  )
  await expect(testService.findSuggestions(text.chapters[0])).resolves.toEqual(
    lemmatization
  )
})
