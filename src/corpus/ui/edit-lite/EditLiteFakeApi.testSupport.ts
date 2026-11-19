import { toLineDto } from 'corpus/application/chapterDtoSerialization'
import { ChapterAtfSnapshotDto } from 'corpus/application/edit-lite/chapterAtfSnapshot'
import { LinesUpdateDto } from 'corpus/application/edit-lite/ChapterEditSource'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import FakeApi from 'test-support/FakeApi'
import { createChapterUrl, Dto } from 'test-support/FakeApiExpectation'
import { ChapterId } from 'transliteration/domain/chapter-id'

function toChapterId(outline: ChapterOutline): ChapterId {
  return { textId: outline.textId, stage: outline.stage, name: outline.name }
}

export default class EditLiteFakeApi extends FakeApi {
  expectChapterOutline(outline: ChapterOutline): this {
    return this.expectGet(
      `${createChapterUrl(toChapterId(outline))}/outline`,
      outline,
    )
  }

  allowChapterLines(
    id: ChapterId,
    offset: number,
    limit: number,
    lines: readonly Line[],
  ): this {
    return this.allowGet(
      `${createChapterUrl(id)}/lines?offset=${offset}&limit=${limit}`,
      {
        total: lines.length,
        offset,
        limit,
        lines: lines.slice(offset, offset + limit).map(toLineDto),
      },
    )
  }

  expectChapterAtfSnapshot(
    id: ChapterId,
    snapshot: ChapterAtfSnapshotDto,
  ): this {
    return this.expectGet(
      `${createChapterUrl(id)}/display?lines=0&variants=0`,
      snapshot,
    )
  }

  allowChapterManuscripts(id: ChapterId, manuscripts: readonly Dto[]): this {
    return this.allowGet(`${createChapterUrl(id)}/manuscripts`, manuscripts)
  }

  expectUpdateEditedLines(
    id: ChapterId,
    update: LinesUpdateDto,
    outline: ChapterOutline,
  ): this {
    return this.expectPost(
      `${createChapterUrl(id)}/lines?view=outline`,
      update,
      outline,
    )
  }
}
