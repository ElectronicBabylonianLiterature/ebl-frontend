import { apiOutline } from 'corpus/application/edit-lite/chapterEditSource.testSupport'
import { LinesUpdateDto } from 'corpus/application/edit-lite/ChapterEditSource'
import { toLineEditsDto } from 'corpus/application/edit-lite/lineEdits'
import {
  chapterId,
  chapterUrl,
  createTextServiceTestContext,
} from 'corpus/application/TextService.testSupport'
import { createLine, EditStatus } from 'corpus/domain/line'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const { apiClient, fragmentServiceMock, textService } =
  createTextServiceTestContext()

const update: LinesUpdateDto = toLineEditsDto(
  3,
  createLine({
    number: '4',
    translation: '#tr.en: And Mummu-Tiamat',
    status: EditStatus.EDITED,
  }),
)

beforeEach(() => {
  jest.clearAllMocks()
})

describe('updateEditedLines', () => {
  it('posts the edits and asks for the outline in return', async () => {
    apiClient.postJson.mockResolvedValueOnce(apiOutline)

    await expect(
      textService.updateEditedLines(chapterId, update),
    ).resolves.toBe(apiOutline)
    expect(apiClient.postJson.mock.calls).toEqual([
      [
        `${chapterUrl}/lines?view=outline`,
        {
          new: [],
          deleted: [],
          edited: [
            {
              index: 3,
              line: {
                number: '4',
                variants: [],
                isSecondLineOfParallelism: false,
                isBeginningOfSection: false,
                translation: '#tr.en: And Mummu-Tiamat',
              },
            },
          ],
        },
      ],
    ])
  })

  it('loads neither the chapter nor the provenances', async () => {
    apiClient.postJson.mockResolvedValueOnce(apiOutline)

    await textService.updateEditedLines(chapterId, update)

    expect(apiClient.fetchJson).not.toHaveBeenCalled()
    expect(fragmentServiceMock.fetchProvenances).not.toHaveBeenCalled()
  })

  it('rejects with the request error', async () => {
    const error = new Error('Invalid line number.')
    apiClient.postJson.mockRejectedValueOnce(error)

    await expect(textService.updateEditedLines(chapterId, update)).rejects.toBe(
      error,
    )
  })
})
