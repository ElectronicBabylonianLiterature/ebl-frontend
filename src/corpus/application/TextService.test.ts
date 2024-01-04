import Bluebird from 'bluebird'
import _ from 'lodash'
import { TestData, testDelegation } from 'test-support/utils'
import TextService from './TextService'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'
import Lemma from 'transliteration/domain/Lemma'
import {
  chapter,
  chapterDto,
  text,
  textDto,
} from 'test-support/test-corpus-text'
import WordService from 'dictionary/application/WordService'
import FragmentService from 'fragmentarium/application/FragmentService'
import Word from 'dictionary/domain/Word'
import ApiClient from 'http/ApiClient'
import produce, { castDraft } from 'immer'
import { createLine, EditStatus } from 'corpus/domain/line'
import { fragment, fragmentDto, lines } from 'test-support/test-fragment'
import BibliographyService from 'bibliography/application/BibliographyService'
import { ExtantLines } from 'corpus/domain/extant-lines'
import { ChapterDisplay } from 'corpus/domain/chapter'
import textLineFixture, { textLineDto } from 'test-support/lines/text-line'
import { chapterDisplayDtoFactory } from 'test-support/chapter-fixtures'
import {
  bibliographyEntryFactory,
  cslDataFactory,
  referenceDtoFactory,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import { LineDetails, ManuscriptLineDisplay } from 'corpus/domain/line-details'
import { TextLine } from 'transliteration/domain/text-line'
import { ManuscriptTypes, OldSiglum } from 'corpus/domain/manuscript'

import { PeriodModifiers, Periods } from 'common/period'
import { Provenances } from 'corpus/domain/provenance'
import TranslationLine from 'transliteration/domain/translation-line'
import { WritableDraft } from 'immer/dist/internal'
import Reference from 'bibliography/domain/Reference'
import { BibliographyPart } from 'transliteration/domain/markup'
import { NoteLine } from 'transliteration/domain/note-line'
import { ParallelLine } from 'transliteration/domain/parallel-line'
import { fromTransliterationLineDto } from 'transliteration/application/dtos'
import { wordFactory } from 'test-support/word-fixtures'
import createReference from 'bibliography/application/createReference'
import {
  dictionaryLineDisplayDto,
  lineVariantDisplayFactory,
} from 'test-support/dictionary-line-fixtures'
import { fromDictionaryLineDto } from './dtos'

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

const word: Word = wordFactory.build({
  _id: 'aklu I',
  lemma: ['aklu'],
  homonym: 'I',
})

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
      oldSigla: [
        {
          siglum: 'os-test',
          reference: {
            id: 'RN1853',
            linesCited: [],
            notes: '',
            pages: '34-54',
            type: 'DISCUSSION',
          },
        },
      ],
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

const matchingLine = {
  ...chapterDto.lines[0],
  translation: [
    {
      language: 'de',
      extent: null,
      parts: [
        {
          text: 'Test text',
          type: 'StringPart',
        },
      ],
      content: [],
    },
  ],
}

const chapterInfoDto = {
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
  matchingLines: [matchingLine],
  matchingColophonLines: {
    '1': [textLineDto],
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

const chapterDisplayDto = chapterDisplayDtoFactory.build()
const chapterDisplay = new ChapterDisplay(
  chapterDisplayDto.id,
  chapterDisplayDto.textHasDoi,
  chapterDisplayDto.textName,
  chapterDisplayDto.isSingleStage,
  chapterDisplayDto.title,
  chapterDisplayDto.lines.map((dto, index) => ({
    ...dto,
    originalIndex: index,
    oldLineNumbers:
      dto.oldLineNumbers?.map((oldLineNumberDto) => ({
        number: oldLineNumberDto.number,
        reference: createReference(oldLineNumberDto.reference),
      })) ?? [],
    translation: dto.translation.map(
      (translation) => new TranslationLine(translation)
    ),
    variants: dto.variants.map((variant, index) => ({
      ...variant,
      reconstruction: variant.reconstruction.map((token, index) => ({
        ...token,
        sentenceIndex: index,
      })),
      note: variant.note && new NoteLine(variant.note),
      parallelLines: variant.parallelLines.map(
        (parallel) => fromTransliterationLineDto(parallel) as ParallelLine
      ),
      isPrimaryVariant: index === 0,
    })),
  })),
  chapterDisplayDto.record,
  chapterDisplayDto.atf
)

const chapterId = chapter.id
const chapterUrl = `/texts/${encodeURIComponent(
  chapter.textId.genre
)}/${encodeURIComponent(chapter.textId.category)}/${encodeURIComponent(
  chapter.textId.index
)}/chapters/${encodeURIComponent(chapter.stage)}/${encodeURIComponent(
  chapter.name
)}`

const cslData = cslDataFactory.build()
const oldSiglumReferenceDto = referenceDtoFactory.build(
  {},
  { associations: { document: cslData } }
)

const testData: TestData<TextService>[] = [
  new TestData(
    'find',
    [text.id],
    apiClient.fetchJson,
    text,
    [
      `/texts/${encodeURIComponent(text.genre)}/${encodeURIComponent(
        text.category
      )}/${encodeURIComponent(text.index)}`,
      false,
    ],
    Bluebird.resolve(textDto)
  ),
  new TestData(
    'list',
    [],
    apiClient.fetchJson,
    [text],
    ['/texts', false],
    Bluebird.resolve(textsDto)
  ),
  new TestData(
    'findChapter',
    [chapterId],
    apiClient.fetchJson,
    chapter,
    [chapterUrl, false],
    Bluebird.resolve(chapterDto)
  ),
  new TestData(
    'findChapterDisplay',
    [chapterId],
    apiClient.fetchJson,
    chapterDisplay,
    [`${chapterUrl}/display`, false],
    Bluebird.resolve(chapterDisplay)
  ),
  new TestData(
    'findChapterLine',
    [chapterId, 0, 0],
    apiClient.fetchJson,
    new LineDetails(
      [
        lineVariantDisplayFactory.build({
          reconstruction: [],
          note: new NoteLine({
            content: [],
            parts: [
              {
                text: 'note note',
                type: 'StringPart',
              },
            ],
          }),
          manuscripts: [
            new ManuscriptLineDisplay(
              Provenances.Nippur,
              PeriodModifiers['Early'],
              Periods['Ur III'],
              ManuscriptTypes.School,
              '1',
              [new OldSiglum('OS1', createReference(oldSiglumReferenceDto))],
              ['o'],
              new TextLine(lines[0]),
              [],
              [],
              [],
              'BM.X',
              false,
              'X.1'
            ),
          ],
        }),
      ],
      0
    ),
    [`${chapterUrl}/lines/0`, false],
    Bluebird.resolve({
      variants: [
        {
          reconstruction: [],
          note: {
            prefix: '#note: ',
            content: [],
            parts: [
              {
                text: 'note note',
                type: 'StringPart',
              },
            ],
          },
          manuscripts: [
            {
              provenance: 'Nippur',
              periodModifier: 'Early',
              period: 'Ur III',
              siglumDisambiguator: '1',
              oldSigla: [
                {
                  siglum: 'OS1',
                  reference: oldSiglumReferenceDto,
                },
              ],
              type: 'School',
              labels: ['o'],
              line: lines[0],
              paratext: [],
              references: [],
              joins: [],
              museumNumber: 'BM.X',
              isInFragmentarium: false,
              accession: 'X.1',
            },
          ],
          parallelLines: [],
          intertext: [],
          originalIndex: 0,
          isPrimaryVariant: true,
        },
      ],
    })
  ),
  new TestData(
    'findColophons',
    [chapterId],
    apiClient.fetchJson,
    [{ siglum: 'NinNA1a', text: fragment.text }],
    [`${chapterUrl}/colophons`, false],
    Bluebird.resolve([{ siglum: 'NinNA1a', text: fragmentDto.text }])
  ),
  new TestData(
    'findUnplacedLines',
    [chapterId],
    apiClient.fetchJson,
    [{ siglum: 'NinNA1a', text: fragment.text }],
    [`${chapterUrl}/unplaced_lines`, false],
    Bluebird.resolve([{ siglum: 'NinNA1a', text: fragmentDto.text }])
  ),
  new TestData(
    'findExtantLines',
    [chapterId],
    apiClient.fetchJson,
    extantLines,
    [`${chapterUrl}/extant_lines`, false],
    Bluebird.resolve(extantLines)
  ),
  new TestData(
    'findManuscripts',
    [chapterId],
    apiClient.fetchJson,
    chapter.manuscripts,
    [`${chapterUrl}/manuscripts`, false],
    Bluebird.resolve(chapterDto.manuscripts)
  ),
  new TestData(
    'searchTransliteration',
    ['kur', 0],
    apiClient.fetchJson,
    {
      chapterInfos: [
        {
          ...chapterInfoDto,
          matchingLines: [
            {
              ...chapter.lines[0],
              translation: [
                new TranslationLine({
                  language: 'de',
                  extent: null,
                  parts: [
                    {
                      text: 'Test text',
                      type: 'StringPart',
                    },
                  ],
                  content: [],
                }),
              ],
            },
          ],
          matchingColophonLines: { '1': [textLineFixture] },
        },
      ],
      totalCount: 1,
    },
    ['/textsearch?paginationIndex=0&transliteration=kur', false],
    Bluebird.resolve({ chapterInfos: [chapterInfoDto], totalCount: 1 })
  ),
  new TestData(
    'updateAlignment',
    [chapterId, chapter.alignment],
    apiClient.postJson,
    chapter,
    [`${chapterUrl}/alignment`, alignmentDto],
    Bluebird.resolve(chapterDto)
  ),
  new TestData(
    'updateLemmatization',
    [chapterId, lemmatization],
    apiClient.postJson,
    chapter,
    [`${chapterUrl}/lemmatization`, lemmatizationDto],
    Bluebird.resolve(chapterDto)
  ),
  new TestData(
    'updateManuscripts',
    [chapterId, chapter.manuscripts, chapter.uncertainFragments],
    apiClient.postJson,
    chapter,
    [`${chapterUrl}/manuscripts`, manuscriptsDto],
    Bluebird.resolve(chapterDto)
  ),
  new TestData(
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
    Bluebird.resolve(chapterDto)
  ),
  new TestData(
    'importChapter',
    [chapterId, '1. kur'],
    apiClient.postJson,
    chapter,
    [`${chapterUrl}/import`, { atf: '1. kur' }],
    Bluebird.resolve(chapterDto)
  ),
  new TestData(
    'searchLemma',
    ['qanû I', 'L'],
    apiClient.fetchJson,
    [fromDictionaryLineDto(dictionaryLineDisplayDto)],
    [`/lemmasearch?genre=L&lemma=${encodeURIComponent('qanû I')}`, false],
    Bluebird.resolve([dictionaryLineDisplayDto])
  ),
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
  function createInjectedPart(
    reference: Reference
  ): WritableDraft<BibliographyPart> {
    return {
      reference: {
        id: reference.id,
        type: reference.type,
        pages: reference.pages,
        notes: reference.notes,
        linesCited: castDraft(reference.linesCited),
      },
      type: 'BibliographyPart',
    }
  }

  const translationReference = referenceFactory.build(
    {},
    {
      associations: {
        document: bibliographyEntryFactory.build(
          {},
          { associations: { id: 'XY1' } }
        ),
      },
    }
  )
  const intertextReference = referenceFactory.build(
    {},
    {
      associations: {
        document: bibliographyEntryFactory.build(
          {},
          { associations: { id: 'XY2' } }
        ),
      },
    }
  )
  const chapterWithReferences = produce(chapterDisplay, (draft) => {
    draft.lines[0].translation[0].parts = [
      createInjectedPart(translationReference),
    ]
    draft.lines[0].variants[0].intertext = [
      createInjectedPart(intertextReference),
    ]
  })
  const injectedChapter = produce(chapterDisplay, (draft) => {
    draft.lines[0].translation[0].parts = [
      {
        reference: castDraft(translationReference),
        type: 'BibliographyPart',
      },
    ]
    draft.lines[0].variants[0].intertext = [
      {
        reference: castDraft(intertextReference),
        type: 'BibliographyPart',
      },
    ]
  })
  apiClient.fetchJson.mockReturnValue(Bluebird.resolve(chapterWithReferences))
  bibliographyServiceMock.findMany.mockReturnValueOnce(
    Bluebird.resolve([translationReference.document])
  )
  bibliographyServiceMock.findMany.mockReturnValueOnce(
    Bluebird.resolve([intertextReference.document])
  )
  await expect(testService.findChapterDisplay(chapterId)).resolves.toEqual(
    injectedChapter
  )
  expect(apiClient.fetchJson).toHaveBeenCalledWith(
    `${chapterUrl}/display`,
    false
  )
  expect(bibliographyServiceMock.findMany).toHaveBeenCalledWith([
    translationReference.id,
  ])
  expect(bibliographyServiceMock.findMany).toHaveBeenCalledWith([
    intertextReference.id,
  ])
})

test('listAllTexts', async () => {
  testService.listAllTexts()
  expect(apiClient.fetchJson).toHaveBeenCalledWith('/corpus/texts/all', false)
})

test('listAllChapters', async () => {
  testService.listAllChapters()
  expect(apiClient.fetchJson).toHaveBeenCalledWith(
    '/corpus/chapters/all',
    false
  )
})
