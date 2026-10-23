import { ApiError } from 'http/ApiClient'
import {
  chapterDisplayDto,
  chapterId,
  createTextServiceTestContext,
} from 'corpus/application/TextService.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

const reference = {
  id: 'unavailable-reference',
  type: 'COPY' as const,
  pages: '12–14',
  notes: 'Old edition',
  linesCited: ['o 1'],
}

test.each([404, 500])(
  'preserves chapter content when an old line bibliography lookup returns %s',
  async (status) => {
    const {
      apiClient,
      bibliographyServiceMock,
      fragmentServiceMock,
      createService,
    } = createTextServiceTestContext()
    fragmentServiceMock.fetchProvenances.mockResolvedValue([])
    bibliographyServiceMock.find.mockRejectedValue(
      new ApiError('Bibliography unavailable', {}, status),
    )
    apiClient.fetchJson.mockResolvedValue({
      ...chapterDisplayDto,
      lines: [
        {
          ...chapterDisplayDto.lines[0],
          oldLineNumbers: [{ number: 'A38', reference }],
        },
      ],
    })

    const result = await createService().findChapterDisplay(chapterId)

    expect(result.id).toEqual(chapterDisplayDto.id)
    expect(result.lines[0].variants).toHaveLength(
      chapterDisplayDto.lines[0].variants.length,
    )
    expect(result.lines[0].oldLineNumbers).toEqual([
      {
        number: 'A38',
        reference: expect.objectContaining({
          ...reference,
          referenceId: reference.id,
          hasUnresolvedDocument: true,
        }),
      },
    ])
    expect(bibliographyServiceMock.find).toHaveBeenCalledWith(reference.id)
  },
)
