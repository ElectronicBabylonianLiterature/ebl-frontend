import ChapterOutlineService, {
  ChapterOutlineService as NamedChapterOutlineService,
} from 'corpus/application/ChapterOutlineService'
import { fromLineDto } from 'corpus/application/dtos'
import { apiOutline } from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import { LinesPageDto } from 'corpus/application/edit-lite/chapterOutline'
import TextReadService from 'corpus/application/TextReadService'
import TextService from 'corpus/application/TextService'
import {
  chapterId,
  chapterUrl,
  createTextServiceTestContext,
} from 'corpus/application/TextService.testSupport'
import { EditStatus } from 'corpus/domain/line'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const {
  apiClient,
  fragmentServiceMock,
  wordServiceMock,
  bibliographyServiceMock,
  textService,
} = createTextServiceTestContext()

const service = new ChapterOutlineService(
  apiClient,
  fragmentServiceMock,
  wordServiceMock,
  bibliographyServiceMock,
)

const linesPage: LinesPageDto = {
  total: 162,
  offset: 20,
  limit: 2,
  lines: [
    {
      number: '21',
      oldLineNumbers: [{ number: 'old 21', reference: { id: 'RN1' } }],
      isSecondLineOfParallelism: true,
      isBeginningOfSection: false,
      translation: '#tr.en: The divine brethren',
      variants: [
        {
          reconstruction: '%n innendū-ma',
          intertext: '',
          manuscripts: [
            {
              manuscriptId: 1,
              labels: ['o'],
              number: '21',
              atf: 'in-nen-du-ma',
              omittedWords: [],
            },
          ],
        },
      ],
    },
    {
      number: '22',
      isSecondLineOfParallelism: false,
      isBeginningOfSection: false,
      translation: '',
      variants: [],
    },
  ],
  revision: 'revision-7',
}

beforeEach(() => {
  jest.clearAllMocks()
  fragmentServiceMock.fetchProvenances.mockResolvedValue([])
})

it('is a text read service that the text service builds on', () => {
  expect(NamedChapterOutlineService).toBe(ChapterOutlineService)
  expect(service).toBeInstanceOf(TextReadService)
  expect(textService).toBeInstanceOf(ChapterOutlineService)
  expect(textService).toBeInstanceOf(TextService)
})

describe('findChapterOutline', () => {
  it('fetches the outline of the chapter', async () => {
    const signal = new AbortController().signal
    apiClient.fetchJson.mockResolvedValueOnce(apiOutline)

    await expect(service.findChapterOutline(chapterId, signal)).resolves.toBe(
      apiOutline,
    )
    expect(apiClient.fetchJson.mock.calls).toEqual([
      [`${chapterUrl}/outline`, false, signal],
    ])
    expect(fragmentServiceMock.fetchProvenances).not.toHaveBeenCalled()
  })

  it('rejects with the request error', async () => {
    const error = new Error('Not Found')
    apiClient.fetchJson.mockRejectedValueOnce(error)

    await expect(service.findChapterOutline(chapterId)).rejects.toBe(error)
    expect(apiClient.fetchJson.mock.calls).toEqual([
      [`${chapterUrl}/outline`, false, undefined],
    ])
  })
})

describe('findChapterLines', () => {
  it('fetches one page of lines in edit shape', async () => {
    const signal = new AbortController().signal
    apiClient.fetchJson.mockResolvedValueOnce(linesPage)

    const lines = await service.findChapterLines(chapterId, 20, 2, signal)

    expect(apiClient.fetchJson.mock.calls).toEqual([
      [`${chapterUrl}/lines?offset=20&limit=2`, false, signal],
    ])
    expect(lines).toEqual(linesPage.lines.map(fromLineDto))
    expect(lines.map((line) => line.status)).toEqual([
      EditStatus.CLEAN,
      EditStatus.CLEAN,
    ])
    expect(lines[0]).toHaveProperty(
      'oldLineNumbers',
      linesPage.lines[0].oldLineNumbers,
    )
    expect(lines[0].variants[0].manuscripts[0].atf).toBe('in-nen-du-ma')
  })

  it('returns no lines for a page past the end', async () => {
    apiClient.fetchJson.mockResolvedValueOnce({ ...linesPage, lines: [] })

    await expect(service.findChapterLines(chapterId, 200, 10)).resolves.toEqual(
      [],
    )
    expect(apiClient.fetchJson.mock.calls).toEqual([
      [`${chapterUrl}/lines?offset=200&limit=10`, false, undefined],
    ])
  })

  it('asks for the lines of the given revision', async () => {
    const signal = new AbortController().signal
    apiClient.fetchJson.mockResolvedValueOnce(linesPage)

    await expect(
      service.findChapterLines(chapterId, 20, 2, signal, {
        revision: 'revision 7/a',
      }),
    ).resolves.toEqual(linesPage.lines.map(fromLineDto))
    expect(apiClient.fetchJson.mock.calls).toEqual([
      [
        `${chapterUrl}/lines?offset=20&limit=2&revision=revision%207%2Fa`,
        false,
        signal,
      ],
    ])
  })

  it.each([[undefined], ['']])(
    'omits the unknown revision %p',
    async (revision) => {
      apiClient.fetchJson.mockResolvedValueOnce(linesPage)

      await service.findChapterLines(chapterId, 20, 2, undefined, {
        revision,
      })

      expect(apiClient.fetchJson.mock.calls).toEqual([
        [`${chapterUrl}/lines?offset=20&limit=2`, false, undefined],
      ])
    },
  )

  it('rejects with the request error', async () => {
    const error = new Error('Conflict')
    apiClient.fetchJson.mockRejectedValueOnce(error)

    await expect(
      service.findChapterLines(chapterId, 20, 2, undefined, {
        revision: 'revision-7',
      }),
    ).rejects.toBe(error)
  })
})
