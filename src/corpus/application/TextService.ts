import { ChapterAlignment } from 'corpus/domain/alignment'
import { Chapter } from 'corpus/domain/chapter'
import { ChapterId } from 'transliteration/domain/chapter-id'
import { ChapterLemmatization } from 'corpus/domain/lemmatization'
import { Line } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'

import {
  fromChapterDto,
  toAlignmentDto,
  toLemmatizationDto,
  toLinesDto,
  toManuscriptsDto,
} from 'corpus/application/dtos'

import { createChapterUrl } from 'corpus/application/chapterUrls'
import ChapterOutlineService from 'corpus/application/ChapterOutlineService'
import { LinesUpdateDto } from 'corpus/application/edit-lite/ChapterEditSource'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'

export { createChapterUrl } from 'corpus/application/chapterUrls'

export default class TextService extends ChapterOutlineService {
  updateAlignment(
    id: ChapterId,
    alignment: ChapterAlignment,
  ): Promise<Chapter> {
    return this.postChapterUpdate(id, 'alignment', toAlignmentDto(alignment))
  }

  updateLemmatization(
    id: ChapterId,
    lemmatization: ChapterLemmatization,
  ): Promise<Chapter> {
    return this.postChapterUpdate(
      id,
      'lemmatization',
      toLemmatizationDto(lemmatization),
    )
  }

  updateManuscripts(
    id: ChapterId,
    manuscripts: readonly Manuscript[],
    uncertainChapters: readonly string[],
  ): Promise<Chapter> {
    return this.postChapterUpdate(
      id,
      'manuscripts',
      toManuscriptsDto(manuscripts, uncertainChapters),
    )
  }

  updateLines(id: ChapterId, lines: readonly Line[]): Promise<Chapter> {
    return this.postChapterUpdate(id, 'lines', toLinesDto(lines))
  }

  importChapter(id: ChapterId, atf: string): Promise<Chapter> {
    return this.postChapterUpdate(id, 'import', { atf })
  }

  updateEditedLines(
    id: ChapterId,
    update: LinesUpdateDto,
    revision?: string,
  ): Promise<ChapterOutline> {
    return this.apiClient.postJson<ChapterOutline>(
      this.createLinesUrl(id, { view: 'outline', revision }),
      update,
    )
  }

  private postChapterUpdate(
    id: ChapterId,
    endpoint: string,
    dto: unknown,
  ): Promise<Chapter> {
    return Promise.all([
      this.loadProvenances(),
      this.apiClient.postJson(`${createChapterUrl(id)}/${endpoint}`, dto),
    ]).then(([, chapterDto]) => fromChapterDto(chapterDto))
  }
}
