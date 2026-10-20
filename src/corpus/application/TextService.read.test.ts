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
} from 'corpus/application/TextService.regression.testSupport'

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
      undefined,
    ],
    Promise.resolve(textDto),
  ),
  new TestData(
    'list',
    [],
    apiClient.fetchJson,
    [text],
    ['/texts', false],
    Promise.resolve(textsDto),
  ),
  new TestData(
    'findChapter',
    [chapterId],
    apiClient.fetchJson,
    chapter,
    [chapterUrl, false, undefined],
    Promise.resolve(chapterDto),
  ),
  new TestData(
    'findChapterDisplay',
    [chapterId],
    apiClient.fetchJson,
    chapterDisplay,
    [`${chapterUrl}/display`, false],
    Promise.resolve(chapterDisplay),
  ),
  new TestData(
    'findColophons',
    [chapterId],
    apiClient.fetchJson,
    [{ siglum: 'NinNA1a', text: fragment.text }],
    [`${chapterUrl}/colophons`, false, undefined],
    Promise.resolve([{ siglum: 'NinNA1a', text: fragmentDto.text }]),
  ),
  new TestData(
    'findUnplacedLines',
    [chapterId],
    apiClient.fetchJson,
    [{ siglum: 'NinNA1a', text: fragment.text }],
    [`${chapterUrl}/unplaced_lines`, false, undefined],
    Promise.resolve([{ siglum: 'NinNA1a', text: fragmentDto.text }]),
  ),
  new TestData(
    'findExtantLines',
    [chapterId],
    apiClient.fetchJson,
    extantLines,
    [`${chapterUrl}/extant_lines`, false, undefined],
    Promise.resolve(extantLines),
  ),
  new TestData(
    'findManuscripts',
    [chapterId],
    apiClient.fetchJson,
    chapter.manuscripts,
    [`${chapterUrl}/manuscripts`, false, undefined],
    Promise.resolve(chapterDto.manuscripts),
  ),
]

beforeEach(() => {
  setupProvenances()
})

describe('TextService', () => testDelegation(testService, testData))
