import { stringify } from 'common/utils/queryString'
import { createChapterUrl } from 'corpus/application/chapterUrls'
import { fromLineDto } from 'corpus/application/dtos'
import {
  ChapterOutline,
  LinesPageDto,
} from 'corpus/application/edit-lite/chapterOutline'
import { ChapterAtfSnapshotDto } from 'corpus/application/edit-lite/chapterAtfSnapshot'
import TextReadService from 'corpus/application/TextReadService'
import { Line } from 'corpus/domain/line'
import { ChapterId } from 'transliteration/domain/chapter-id'

type LinesUrlParameters = Readonly<Record<string, string | number | undefined>>

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
        this.createLinesUrl(id, { offset, limit, revision }),
        false,
        signal,
      )
      .then((page) => page.lines.map(fromLineDto))
  }

  protected createLinesUrl(
    id: ChapterId,
    parameters: LinesUrlParameters,
  ): string {
    const query = stringify(parameters, { sort: false, skipEmptyString: true })
    return `${createChapterUrl(id)}/lines?${query}`
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
