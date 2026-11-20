import { createChapterUrl } from 'corpus/application/chapterUrls'
import { fromLineDto } from 'corpus/application/dtos'
import {
  ChapterOutline,
  LinesPageDto,
} from 'corpus/application/edit-lite/chapterOutline'
import { ChapterAtfSnapshotDto } from 'corpus/application/edit-lite/chapterAtfSnapshot'
import { createChapterEndpointUrl } from 'corpus/application/edit-lite/chapterRequests'
import TextReadService from 'corpus/application/TextReadService'
import { Line } from 'corpus/domain/line'
import { ChapterId } from 'transliteration/domain/chapter-id'

export class ChapterOutlineService extends TextReadService {
  findChapterOutline(
    id: ChapterId,
    signal?: AbortSignal,
  ): Promise<ChapterOutline> {
    return this.apiClient.fetchJson<ChapterOutline>(
      `${createChapterUrl(id)}/outline`,
      false,
      signal,
    )
  }

  findChapterLines(
    id: ChapterId,
    offset: number,
    limit: number,
    signal?: AbortSignal,
    revision?: string,
  ): Promise<readonly Line[]> {
    return this.apiClient
      .fetchJson<LinesPageDto>(
        createChapterEndpointUrl(id, 'lines', { offset, limit, revision }),
        false,
        signal,
      )
      .then((page) => page.lines.map(fromLineDto))
  }

  findChapterAtfSnapshot(
    id: ChapterId,
    signal?: AbortSignal,
  ): Promise<ChapterAtfSnapshotDto> {
    return Promise.all([
      this.loadProvenances(),
      this.apiClient.fetchJson<ChapterAtfSnapshotDto>(
        `${createChapterUrl(id)}/display?lines=0&variants=0`,
        false,
        signal,
      ),
    ]).then(([, snapshot]) => snapshot)
  }
}

export default ChapterOutlineService
