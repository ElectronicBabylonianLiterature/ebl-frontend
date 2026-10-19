import TextService from 'corpus/application/TextService'
import {
  chapterId,
  chapterUrl,
  createTextServiceTestContext,
} from 'corpus/application/TextService.testSupport'
import { text } from 'test-support/test-corpus-text'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const { apiClient, fragmentServiceMock, textService } =
  createTextServiceTestContext()

const textUrl = `/texts/${encodeURIComponent(text.genre)}/${encodeURIComponent(
  text.category,
)}/${encodeURIComponent(text.index)}`

const reads: [
  string,
  (service: TextService, signal: AbortSignal) => Promise<unknown>,
  string,
][] = [
  ['find', (service, signal) => service.find(text.id, signal), textUrl],
  [
    'findChapter',
    (service, signal) => service.findChapter(chapterId, signal),
    chapterUrl,
  ],
  [
    'findManuscripts',
    (service, signal) => service.findManuscripts(chapterId, signal),
    `${chapterUrl}/manuscripts`,
  ],
  [
    'findColophons',
    (service, signal) => service.findColophons(chapterId, signal),
    `${chapterUrl}/colophons`,
  ],
  [
    'findUnplacedLines',
    (service, signal) => service.findUnplacedLines(chapterId, signal),
    `${chapterUrl}/unplaced_lines`,
  ],
  [
    'findChapterLine',
    (service, signal) => service.findChapterLine(chapterId, 2, 0, signal),
    `${chapterUrl}/lines/2`,
  ],
  [
    'query',
    (service, signal) => service.query({ lemmas: 'kur' }, signal),
    '/corpus/query?lemmas=kur',
  ],
]

beforeEach(() => {
  jest.clearAllMocks()
  fragmentServiceMock.fetchProvenances.mockResolvedValue([])
  apiClient.fetchJson.mockReturnValue(new Promise(() => undefined))
})

it.each(reads)('%s hands its signal to fetchJson', async (_name, read, url) => {
  const signal = new AbortController().signal

  read(textService, signal)
  await Promise.resolve()

  expect(apiClient.fetchJson).toHaveBeenCalledWith(url, false, signal)
})
