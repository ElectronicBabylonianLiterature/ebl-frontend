import { createTextServiceTestContext } from 'corpus/application/TextService.testSupport'

jest.mock('bibliography/application/BibliographyService')
jest.mock('dictionary/application/WordService')
jest.mock('fragmentarium/application/FragmentService')
jest.mock('http/ApiClient')

export {
  chapterDisplay,
  chapterDisplayDto,
  chapterId,
  chapterUrl,
} from 'corpus/application/TextService.testSupport'

export const {
  apiClient,
  fragmentServiceMock,
  bibliographyServiceMock,
  wordServiceMock,
  textService: testService,
} = createTextServiceTestContext()

export function setupProvenances(): void {
  fragmentServiceMock.fetchProvenances.mockResolvedValue([])
}
