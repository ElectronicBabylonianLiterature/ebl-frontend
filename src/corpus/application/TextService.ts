import { ChapterId } from 'transliteration/domain/chapter-id'
import ChapterOutlineService from 'corpus/application/ChapterOutlineService'
import {
  ChapterEndpoint,
  ChapterRequestBody,
  LinesUpdateDto,
} from 'corpus/application/edit-lite/ChapterEditSource'
import { createChapterUpdateUrl } from 'corpus/application/edit-lite/chapterRequests'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'

export { createChapterUrl } from 'corpus/application/chapterUrls'

const textListEndpoints: readonly ChapterEndpoint[] = ['manuscripts', 'import']

export default class TextService extends ChapterOutlineService {
  updateEditedLines(
    id: ChapterId,
    update: LinesUpdateDto,
    revision?: string,
  ): Promise<ChapterOutline> {
    return this.updateChapterOutline(id, 'lines', update, revision)
  }

  updateChapterOutline(
    id: ChapterId,
    endpoint: ChapterEndpoint,
    body: ChapterRequestBody,
    revision?: string,
  ): Promise<ChapterOutline> {
    return this.apiClient.postJson<ChapterOutline>(
      createChapterUpdateUrl(id, endpoint, revision),
      body,
      true,
      () => this.invalidateCachesAfterUpdate(id, endpoint),
    )
  }

  private invalidateCachesAfterUpdate(
    id: ChapterId,
    endpoint: ChapterEndpoint,
  ): void {
    this.invalidateChapterDisplayCache(id)
    if (textListEndpoints.includes(endpoint)) {
      this.cachedTexts = null
    }
  }
}
