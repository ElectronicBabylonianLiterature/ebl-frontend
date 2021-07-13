import Bluebird from 'bluebird'
import _ from 'lodash'
import { testDelegation, TestData } from 'test-support/utils'
import TextService from './TextService'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'
import Lemma from 'transliteration/domain/Lemma'
import {
  chapter,
  text,
  chapterDto,
  textDto,
} from 'test-support/test-corpus-text'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import Word from 'dictionary/domain/Word'
import ApiClient from 'http/ApiClient'
import produce, { castDraft } from 'immer'
import { createLine, EditStatus } from 'corpus/domain/line'

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
              type: '',
              language: '',
            },
            {
              value: 'ra',
              alignment: 1,
              variant: 'ra',
              type: 'Word',
              language: 'AKKADIAN',
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
      colophon: '1. kur',
      unplacedLines: '1. bu',
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
  uncertainFragments: ['K.1'],
}

const textsDto = [textDto]

const searchDto = {
  id: {
    textId: {
      genre: 'L',
      category: 1,
      index: 2,
    },
    stage: 'Old Babyblonian',
    name: 'My Chapter',
  },
  siglums: { '1': 'NinSchb' },
  matchingLines: chapterDto.lines,
  matchingColophonLines: {
    '1': ['1. kur'],
  },
}

const chapterUrl = `/texts/${encodeURIComponent(
  chapter.textId.genre
)}/${encodeURIComponent(chapter.textId.category)}/${encodeURIComponent(
  chapter.textId.index
)}/chapters/${encodeURIComponent(chapter.stage)}/${encodeURIComponent(
  chapter.name
)}`

const testData: TestData[] = [
  [
    'find',
    [text.genre, text.category, text.index],
    apiClient.fetchJson,
    text,
    [
      `/texts/${encodeURIComponent(text.genre)}/${encodeURIComponent(
        text.category
      )}/${encodeURIComponent(text.index)}`,
      true,
    ],
    Bluebird.resolve(textDto),
  ],
  [
    'list',
    [],
    apiClient.fetchJson,
    [text],
    ['/texts', false],
    Bluebird.resolve(textsDto),
  ],
  [
    'searchTransliteration',
    ['kur'],
    apiClient.fetchJson,
    [
      produce(searchDto, (draft: any) => {
        draft.matchingLines = castDraft(chapter.lines)
      }),
    ],
    ['/textsearch?transliteration=kur', true],
    Bluebird.resolve([searchDto]),
  ],
  [
    'updateAlignment',
    [
      chapter.textId.genre,
      chapter.textId.category,
      chapter.textId.index,
      chapter.stage,
      chapter.name,
      chapter.alignment,
    ],
    apiClient.postJson,
    chapter,
    [`${chapterUrl}/alignment`, alignmentDto],
    Bluebird.resolve(chapterDto),
  ],
  [
    'updateLemmatization',
    [
      chapter.textId.genre,
      chapter.textId.category,
      chapter.textId.index,
      chapter.stage,
      chapter.name,
      lemmatization,
    ],
    apiClient.postJson,
    chapter,
    [`${chapterUrl}/lemmatization`, lemmatizationDto],
    Bluebird.resolve(chapterDto),
  ],
  [
    'updateManuscripts',
    [
      chapter.textId.genre,
      chapter.textId.category,
      chapter.textId.index,
      chapter.stage,
      chapter.name,
      chapter.manuscripts,
      chapter.uncertainFragments,
    ],
    apiClient.postJson,
    chapter,
    [`${chapterUrl}/manuscripts`, manuscriptsDto],
    Bluebird.resolve(chapterDto),
  ],
  [
    'updateLines',
    [
      chapter.textId.genre,
      chapter.textId.category,
      chapter.textId.index,
      chapter.stage,
      chapter.name,
      [
        createLine({ number: '1', status: EditStatus.DELETED }),
        createLine({ number: '2', status: EditStatus.EDITED }),
        createLine({ number: '3', status: EditStatus.NEW }),
      ],
    ],
    apiClient.postJson,
    chapter,
    [
      `${chapterUrl}/lines`,
      {
        edited: [
          { index: 1, line: _.omit(createLine({ number: '2' }), 'status') },
        ],
        deleted: [0],
        new: [_.omit(createLine({ number: '3' }), 'status')],
      },
    ],
    Bluebird.resolve(chapterDto),
  ],
  [
    'importChapter',
    [
      chapter.textId.genre,
      chapter.textId.category,
      chapter.textId.index,
      chapter.stage,
      chapter.name,
      '1. kur',
    ],
    apiClient.postJson,
    chapter,
    [`${chapterUrl}/import`, { atf: '1. kur' }],
    Bluebird.resolve(chapterDto),
  ],
]

describe('TextService', () => testDelegation(testService, testData))

test('findSuggestions', async () => {
  wordServiceMock.find.mockReturnValue(Bluebird.resolve(word))
  fragmentServiceMock.findSuggestions.mockReturnValue(Bluebird.resolve([]))
  await expect(testService.findSuggestions(chapter)).resolves.toEqual(
    lemmatization
  )
})
