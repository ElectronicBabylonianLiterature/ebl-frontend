import Bluebird from 'bluebird'
import TextService from 'corpus/application/TextService'
import { ExtantLines } from 'corpus/domain/extant-lines'
import { TestData, testDelegation } from 'test-support/utils'
import {
  chapter,
  chapterDto,
  text,
  textDto,
} from 'test-support/test-corpus-text'
import { fragment, fragmentDto } from 'test-support/test-fragment'
import {
  apiClient,
  chapterDisplay,
  chapterId,
  chapterUrl,
  setupProvenances,
  testService,
} from 'corpus/application/textService.testSupport'

const textsDto = [textDto]

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

const testData: TestData<TextService>[] = [
  new TestData(
    'find',
    [text.id],
    apiClient.fetchJson,
    text,
    [
      `/texts/${encodeURIComponent(text.genre)}/${encodeURIComponent(
        text.category,
      )}/${encodeURIComponent(text.index)}`,
      false,
    ],
    Bluebird.resolve(textDto),
  ),
  new TestData(
    'list',
    [],
    apiClient.fetchJson,
    [text],
    ['/texts', false],
    Bluebird.resolve(textsDto),
  ),
  new TestData(
    'findChapter',
    [chapterId],
    apiClient.fetchJson,
    chapter,
    [chapterUrl, false],
    Bluebird.resolve(chapterDto),
  ),
  new TestData(
    'findChapterDisplay',
    [chapterId],
    apiClient.fetchJson,
    chapterDisplay,
    [`${chapterUrl}/display`, false],
    Bluebird.resolve(chapterDisplay),
  ),
  new TestData(
    'findColophons',
    [chapterId],
    apiClient.fetchJson,
    [{ siglum: 'NinNA1a', text: fragment.text }],
    [`${chapterUrl}/colophons`, false],
    Bluebird.resolve([{ siglum: 'NinNA1a', text: fragmentDto.text }]),
  ),
  new TestData(
    'findUnplacedLines',
    [chapterId],
    apiClient.fetchJson,
    [{ siglum: 'NinNA1a', text: fragment.text }],
    [`${chapterUrl}/unplaced_lines`, false],
    Bluebird.resolve([{ siglum: 'NinNA1a', text: fragmentDto.text }]),
  ),
  new TestData(
    'findExtantLines',
    [chapterId],
    apiClient.fetchJson,
    extantLines,
    [`${chapterUrl}/extant_lines`, false],
    Bluebird.resolve(extantLines),
  ),
  new TestData(
    'findManuscripts',
    [chapterId],
    apiClient.fetchJson,
    chapter.manuscripts,
    [`${chapterUrl}/manuscripts`, false],
    Bluebird.resolve(chapterDto.manuscripts),
  ),
]

beforeEach(() => {
  setupProvenances()
})

describe('TextService', () => testDelegation(testService, testData))
