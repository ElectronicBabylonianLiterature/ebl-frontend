import SentryErrorReporter from 'common/errors/SentryErrorReporter'
import { createLineTestData } from 'corpus/application/TextService.line.testSupport'
import {
  chapterDisplay,
  chapterDisplayDto,
  chapterId,
  createTextServiceTestContext,
} from 'corpus/application/TextService.testSupport'
import { deferred } from 'test-support/concurrencyLimiterHelpers'
import { chapter, chapterDto } from 'test-support/test-corpus-text'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')
jest.mock('common/errors/SentryErrorReporter')

const { apiClient, fragmentServiceMock, createService } =
  createTextServiceTestContext()

beforeEach(() => {
  jest.clearAllMocks()
})

const lineTestData = createLineTestData(apiClient)
const reads: [
  string,
  (service: ReturnType<typeof createService>) => Promise<object>,
  object,
  unknown,
][] = [
  [
    'findManuscripts',
    (service) => service.findManuscripts(chapterId),
    chapterDto.manuscripts,
    chapter.manuscripts,
  ],
  [
    'findChapterDisplay',
    (service) => service.findChapterDisplay(chapterId),
    chapterDisplayDto,
    chapterDisplay,
  ],
  [
    'findChapterLine',
    (service) => service.findChapterLine(chapterId, 0, 0),
    lineTestData.targetResult,
    lineTestData.expectedResult,
  ],
]

const scenarios = reads.map(([name, run, response, expected]) => ({
  name,
  run,
  client: apiClient.fetchJson,
  response,
  expected,
}))

test.each(scenarios)(
  '$name starts its request before provenance preload settles',
  async ({ run, client, response, expected }) => {
    const preload = deferred<void>()
    const error = new Error('provenances unavailable')
    fragmentServiceMock.fetchProvenances.mockReturnValueOnce(
      preload.promise.then(() => {
        throw error
      }),
    )
    client.mockResolvedValueOnce(response)

    const request = run(createService())
    await Promise.resolve()

    expect(client).toHaveBeenCalledTimes(1)
    preload.resolve()
    await expect(request).resolves.toEqual(expected)
    expect(SentryErrorReporter.prototype.captureException).toHaveBeenCalledWith(
      error,
    )
  },
)
