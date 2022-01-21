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
import { fragment, fragmentDto } from 'test-support/test-fragment'
import BibliographyService from 'bibliography/application/BibliographyService'
import { ExtantLines } from 'corpus/domain/extant-lines'
import { ChapterDisplay } from 'corpus/domain/chapter'
import { chapterDisplayFactory } from 'test-support/chapter-fixtures'
import { referenceFactory } from 'test-support/bibliography-fixtures'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()
const MockBibliographyService = BibliographyService as jest.Mock<
  jest.Mocked<BibliographyService>
>
const bibliographyServiceMock = new MockBibliographyService()
const MockFragmentService = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>
const fragmentServiceMock = new MockFragmentService()
const MockWordService = WordService as jest.Mock<jest.Mocked<WordService>>
const wordServiceMock = new MockWordService()
const testService = new TextService(
  apiClient,
  fragmentServiceMock,
  wordServiceMock,
  bibliographyServiceMock
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
  akkadischeGlossareUndIndices: [],
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

const extantLines: ExtantLines = {
  NinNA1a: {
    o: [
      {
        lineNumber: {
          number: 1,
          hasPrime: false,
          suffixModifier: null,
          prefixModifier: null,
        },
        isSideBoundary: false,
      },
    ],
  },
}

const chapterDisplay: ChapterDisplay = chapterDisplayFactory.build()

const chapterId = chapter.id
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
    [text.id],
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
    'findChapter',
    [chapterId],
    apiClient.fetchJson,
    chapter,
    [chapterUrl, true],
    Bluebird.resolve(chapterDto),
  ],
  [
    'findChapterDisplay',
    [chapterId],
    apiClient.fetchJson,
    chapterDisplay,
    [`${chapterUrl}/display`, true],
    Bluebird.resolve(chapterDisplay),
  ],
  [
    'findChapterLine',
    [chapterId, 0],
    apiClient.fetchJson,
    chapter.lines[0],
    [`${chapterUrl}/lines/0`, true],
    Bluebird.resolve(chapterDto.lines[0]),
  ],
  [
    'findColophons',
    [chapterId],
    apiClient.fetchJson,
    [{ siglum: 'NinNA1a', text: fragment.text }],
    [`${chapterUrl}/colophons`, true],
    Bluebird.resolve([{ siglum: 'NinNA1a', text: fragmentDto.text }]),
  ],
  [
    'findUnplacedLines',
    [chapterId],
    apiClient.fetchJson,
    [{ siglum: 'NinNA1a', text: fragment.text }],
    [`${chapterUrl}/unplaced_lines`, true],
    Bluebird.resolve([{ siglum: 'NinNA1a', text: fragmentDto.text }]),
  ],
  [
    'findExtantLines',
    [chapterId],
    apiClient.fetchJson,
    extantLines,
    [`${chapterUrl}/extant_lines`, true],
    Bluebird.resolve(extantLines),
  ],
  [
    'findManuscripts',
    [chapterId],
    apiClient.fetchJson,
    chapter.manuscripts,
    [`${chapterUrl}/manuscripts`, true],
    Bluebird.resolve(chapterDto.manuscripts),
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
    [chapterId, chapter.alignment],
    apiClient.postJson,
    chapter,
    [`${chapterUrl}/alignment`, alignmentDto],
    Bluebird.resolve(chapterDto),
  ],
  [
    'updateLemmatization',
    [chapterId, lemmatization],
    apiClient.postJson,
    chapter,
    [`${chapterUrl}/lemmatization`, lemmatizationDto],
    Bluebird.resolve(chapterDto),
  ],
  [
    'updateManuscripts',
    [chapterId, chapter.manuscripts, chapter.uncertainFragments],
    apiClient.postJson,
    chapter,
    [`${chapterUrl}/manuscripts`, manuscriptsDto],
    Bluebird.resolve(chapterDto),
  ],
  [
    'updateLines',
    [
      chapterId,
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
    [chapterId, '1. kur'],
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

test('inject ChapterDisplay', async () => {
  const translationReference = referenceFactory.build()
  const intertextReference = referenceFactory.build()
  const chapterWithReferences = produce(chapterDisplay, (draft) => {
    draft.lines[0].translation = [
      {
        reference: {
          id: translationReference.id,
          type: translationReference.type,
          pages: translationReference.pages,
          notes: translationReference.notes,
          linesCited: castDraft(translationReference.linesCited),
        },
        type: 'BibliographyPart',
      },
    ]
    draft.lines[0].intertext = [
      {
        reference: {
          id: intertextReference.id,
          type: intertextReference.type,
          pages: intertextReference.pages,
          notes: intertextReference.notes,
          linesCited: castDraft(intertextReference.linesCited),
        },
        type: 'BibliographyPart',
      },
    ]
  })
  const injectedChapter = produce(chapterDisplay, (draft) => {
    draft.lines[0].translation = [
      {
        reference: castDraft(translationReference),
        type: 'BibliographyPart',
      },
    ]
    draft.lines[0].intertext = [
      {
        reference: castDraft(intertextReference),
        type: 'BibliographyPart',
      },
    ]
  })
  apiClient.fetchJson.mockReturnValue(Bluebird.resolve(chapterWithReferences))
  bibliographyServiceMock.find.mockReturnValueOnce(
    Bluebird.resolve(translationReference.document)
  )
  bibliographyServiceMock.find.mockReturnValueOnce(
    Bluebird.resolve(intertextReference.document)
  )
  await expect(testService.findChapterDisplay(chapterId)).resolves.toEqual(
    injectedChapter
  )
  expect(apiClient.fetchJson).toHaveBeenCalledWith(
    `${chapterUrl}/display`,
    true
  )
  expect(bibliographyServiceMock.find).toHaveBeenCalledWith(
    translationReference.id
  )
  expect(bibliographyServiceMock.find).toHaveBeenCalledWith(
    intertextReference.id
  )
})
