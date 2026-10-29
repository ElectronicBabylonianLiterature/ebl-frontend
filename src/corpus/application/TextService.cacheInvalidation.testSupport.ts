import TextService from 'corpus/application/TextService'
import {
  chapterDisplayDto,
  createTextServiceTestContext,
  TextServiceTestContext,
} from 'corpus/application/TextService.testSupport'
import { chapterDto } from 'test-support/test-corpus-text'

export const staleDisplayDto = {
  ...chapterDisplayDto,
  lines: [],
  atf: 'old display',
}

export const freshDisplayDto = { ...staleDisplayDto, atf: 'saved display' }

type ChapterCacheTestContext = TextServiceTestContext & {
  readonly service: TextService
}

export function createChapterCacheTestContext(
  getCacheScope?: () => string,
): ChapterCacheTestContext {
  const context = createTextServiceTestContext()
  context.fragmentServiceMock.fetchProvenances.mockResolvedValue([])
  context.apiClient.fetchJson.mockResolvedValue(staleDisplayDto)
  context.apiClient.postJson.mockImplementation(
    (_path, _body, _authenticate, onHttpSuccess) =>
      Promise.resolve(chapterDto).then((response) => {
        onHttpSuccess?.()
        return response
      }),
  )
  return { ...context, service: context.createService(getCacheScope) }
}
