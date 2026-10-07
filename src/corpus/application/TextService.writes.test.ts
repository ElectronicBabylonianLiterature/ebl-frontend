import _ from 'lodash'
import { TestData, testDelegation } from 'test-support/utils'
import TextService from 'corpus/application/TextService'
import { chapter, chapterDto } from 'test-support/test-corpus-text'
import { createLine, EditStatus } from 'corpus/domain/line'
import { dictionaryLineDisplayDto } from 'test-support/dictionary-line-fixtures'
import { fromDictionaryLineDto } from 'corpus/application/dtos'
import {
  chapterId,
  chapterUrl,
  createTextServiceTestContext,
} from 'corpus/application/TextService.testSupport'
import {
  alignmentDto,
  lemmatization,
  lemmatizationDto,
  manuscriptsDto,
} from 'corpus/application/TextService.update.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const { apiClient, fragmentServiceMock, textService } =
  createTextServiceTestContext()

const testData: TestData<TextService>[] = [
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

beforeEach(() => {
  fragmentServiceMock.fetchProvenances.mockReturnValue(Promise.resolve([]))
})

describe('TextService writes', () => testDelegation(textService, testData))
