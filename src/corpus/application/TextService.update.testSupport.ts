import _ from 'lodash'
import ApiClient from 'http/ApiClient'
import TextService from 'corpus/application/TextService'
import { TestData } from 'test-support/utils'
import { chapter, chapterDto, textDto } from 'test-support/test-corpus-text'
import { createLine, EditStatus } from 'corpus/domain/line'
import { ChapterLemmatization } from 'corpus/domain/lemmatization'
import { dictionaryLineDisplayDto } from 'test-support/dictionary-line-fixtures'
import { fromDictionaryLineDto } from 'corpus/application/dtos'
import {
  chapterId,
  chapterUrl,
  word,
} from 'corpus/application/TextService.testSupport'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'
import Lemma from 'transliteration/domain/Lemma'

export const textsDto = [textDto]

export const alignmentDto = {
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

export const lemmatization: ChapterLemmatization = [
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

export const lemmatizationDto = {
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

export const manuscriptsDto = {
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

export function createWriteTestData(
  apiClient: jest.Mocked<ApiClient>,
): TestData<TextService>[] {
  return [
    new TestData(
      'updateAlignment',
      [chapterId, chapter.alignment],
      apiClient.postJson,
      chapter,
      [`${chapterUrl}/alignment`, alignmentDto],
      Promise.resolve(chapterDto),
    ),
    new TestData(
      'updateLemmatization',
      [chapterId, lemmatization],
      apiClient.postJson,
      chapter,
      [`${chapterUrl}/lemmatization`, lemmatizationDto],
      Promise.resolve(chapterDto),
    ),
    new TestData(
      'updateManuscripts',
      [chapterId, chapter.manuscripts, chapter.uncertainFragments],
      apiClient.postJson,
      chapter,
      [`${chapterUrl}/manuscripts`, manuscriptsDto],
      Promise.resolve(chapterDto),
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
      Promise.resolve(chapterDto),
    ),
    new TestData(
      'importChapter',
      [chapterId, '1. kur'],
      apiClient.postJson,
      chapter,
      [`${chapterUrl}/import`, { atf: '1. kur' }],
      Promise.resolve(chapterDto),
    ),
    new TestData(
      'searchLemma',
      ['qanû I', 'L'],
      apiClient.fetchJson,
      [fromDictionaryLineDto(dictionaryLineDisplayDto)],
      [
        `/lemmasearch?genre=L&lemma=${encodeURIComponent('qanû I')}`,
        false,
        undefined,
      ],
      Promise.resolve([dictionaryLineDisplayDto]),
    ),
  ]
}
