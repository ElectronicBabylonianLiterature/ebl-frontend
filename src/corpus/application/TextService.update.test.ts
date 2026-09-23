import Bluebird from 'bluebird'
import _ from 'lodash'
import TextService from 'corpus/application/TextService'
import Word from 'dictionary/domain/Word'
import { createLine, EditStatus } from 'corpus/domain/line'
import Lemma from 'transliteration/domain/Lemma'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'
import { TestData, testDelegation } from 'test-support/utils'
import { chapter, chapterDto } from 'test-support/test-corpus-text'
import { wordFactory } from 'test-support/word-fixtures'
import { dictionaryLineDisplayDto } from 'test-support/dictionary-line-fixtures'
import { fromDictionaryLineDto } from 'corpus/application/dtos'
import {
  apiClient,
  chapterId,
  chapterUrl,
  setupProvenances,
  testService,
} from 'corpus/application/textService.testSupport'

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

const testData: TestData<TextService>[] = [
  new TestData(
    'updateAlignment',
    [chapterId, chapter.alignment],
    apiClient.postJson,
    chapter,
    [`${chapterUrl}/alignment`, alignmentDto],
    Bluebird.resolve(chapterDto),
  ),
  new TestData(
    'updateLemmatization',
    [chapterId, lemmatization],
    apiClient.postJson,
    chapter,
    [`${chapterUrl}/lemmatization`, lemmatizationDto],
    Bluebird.resolve(chapterDto),
  ),
  new TestData(
    'updateManuscripts',
    [chapterId, chapter.manuscripts, chapter.uncertainFragments],
    apiClient.postJson,
    chapter,
    [`${chapterUrl}/manuscripts`, manuscriptsDto],
    Bluebird.resolve(chapterDto),
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
    Bluebird.resolve(chapterDto),
  ),
  new TestData(
    'importChapter',
    [chapterId, '1. kur'],
    apiClient.postJson,
    chapter,
    [`${chapterUrl}/import`, { atf: '1. kur' }],
    Bluebird.resolve(chapterDto),
  ),
  new TestData(
    'searchLemma',
    ['qanû I', 'L'],
    apiClient.fetchJson,
    [fromDictionaryLineDto(dictionaryLineDisplayDto)],
    [`/lemmasearch?genre=L&lemma=${encodeURIComponent('qanû I')}`, false],
    Bluebird.resolve([dictionaryLineDisplayDto]),
  ),
]

beforeEach(() => {
  setupProvenances()
})

describe('TextService', () => testDelegation(testService, testData))
