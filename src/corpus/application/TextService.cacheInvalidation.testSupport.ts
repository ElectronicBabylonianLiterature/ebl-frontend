import TextService from 'corpus/application/TextService'
import ApiClient from 'http/ApiClient'
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

export function createHttpSuccessPostJsonMock<Response>(
  responsePromise: Promise<Response>,
): (...parameters: Parameters<ApiClient['postJson']>) => Promise<Response> {
  return (_path, _body, _authenticate, onHttpSuccess) =>
    responsePromise.then((response) => {
      onHttpSuccess?.()
      return response
    })
}

export function createChapterCacheTestContext(
  getCacheScope?: () => string,
): ChapterCacheTestContext {
  const context = createTextServiceTestContext()
  context.fragmentServiceMock.fetchProvenances.mockResolvedValue([])
  context.apiClient.fetchJson.mockResolvedValue(staleDisplayDto)
  context.apiClient.postJson.mockImplementation(
    createHttpSuccessPostJsonMock(Promise.resolve(chapterDto)),
  )
  return { ...context, service: context.createService(getCacheScope) }
}
