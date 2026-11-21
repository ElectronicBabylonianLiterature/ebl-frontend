import { toManuscriptsDto } from 'corpus/application/chapterDtoSerialization'
import {
  lineAlignmentDto,
  lineLemmatizationDto,
} from 'corpus/application/edit-lite/annotationFixtures.testSupport'
import { apiOutline } from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import {
  ChapterEndpoint,
  ChapterRequestBody,
} from 'corpus/application/edit-lite/ChapterEditSource'
import { toDeletedLineDto } from 'corpus/application/edit-lite/lineEdits'
import {
  chapterId,
  chapterUrl,
  createTextServiceTestContext,
} from 'corpus/application/TextService.testSupport'
import { Manuscript } from 'corpus/domain/manuscript'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const { apiClient, fragmentServiceMock, textService } =
  createTextServiceTestContext()

const updates: readonly [ChapterEndpoint, ChapterRequestBody][] = [
  ['lines', toDeletedLineDto(2)],
  ['lines/move', { from: 3, to: 0 }],
  ['import', { atf: '1. kur' }],
  [
    'manuscripts',
    toManuscriptsDto([new Manuscript({ id: 1, notes: 'a note' })], ['K.1']),
  ],
  ['lines/4/alignment', lineAlignmentDto],
  ['lines/4/lemmatization', lineLemmatizationDto],
]

beforeEach(() => {
  jest.clearAllMocks()
})

describe.each(updates)('updateChapterOutline of %s', (endpoint, body) => {
  it('posts the body against the revision and resolves with the outline', async () => {
    apiClient.postJson.mockResolvedValueOnce(apiOutline)

    await expect(
      textService.updateChapterOutline(chapterId, endpoint, body, 'revision 7'),
    ).resolves.toBe(apiOutline)
    expect(apiClient.postJson.mock.calls).toEqual([
      [
        `${chapterUrl}/${endpoint}?view=outline&revision=revision%207`,
        body,
        true,
        expect.any(Function),
      ],
    ])
  })

  it.each([[undefined], ['']])(
    'omits the unknown revision %p',
    async (revision) => {
      apiClient.postJson.mockResolvedValueOnce(apiOutline)

      await textService.updateChapterOutline(
        chapterId,
        endpoint,
        body,
        revision,
      )

      expect(apiClient.postJson.mock.calls).toEqual([
        [
          `${chapterUrl}/${endpoint}?view=outline`,
          body,
          true,
          expect.any(Function),
        ],
      ])
    },
  )

  it('loads neither the chapter nor the provenances', async () => {
    apiClient.postJson.mockResolvedValueOnce(apiOutline)

    await textService.updateChapterOutline(chapterId, endpoint, body)

    expect(apiClient.fetchJson).not.toHaveBeenCalled()
    expect(fragmentServiceMock.fetchProvenances).not.toHaveBeenCalled()
  })

  it('rejects with the request error', async () => {
    const error = new Error('Request data failed validation')
    apiClient.postJson.mockRejectedValueOnce(error)

    await expect(
      textService.updateChapterOutline(chapterId, endpoint, body),
    ).rejects.toBe(error)
  })
})
