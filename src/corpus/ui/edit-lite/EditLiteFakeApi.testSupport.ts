import _ from 'lodash'
import { toLineDto } from 'corpus/application/chapterDtoSerialization'
import { ChapterAtfSnapshotDto } from 'corpus/application/edit-lite/chapterAtfSnapshot'
import {
  ChapterEndpoint,
  LinesUpdateDto,
} from 'corpus/application/edit-lite/ChapterEditSource'
import {
  ChapterOutline,
  LinesPageDto,
} from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import FakeApi from 'test-support/FakeApi'
import { createChapterUrl, Dto } from 'test-support/FakeApiExpectation'
import { ChapterId } from 'transliteration/domain/chapter-id'

function toChapterId(outline: ChapterOutline): ChapterId {
  return { textId: outline.textId, stage: outline.stage, name: outline.name }
}

function linesUrl(outline: ChapterOutline): string {
  return `${createChapterUrl(toChapterId(outline))}/lines`
}

export default class EditLiteFakeApi extends FakeApi {
  expectChapterOutline(outline: ChapterOutline): this {
    return this.expectGet(
      `${createChapterUrl(toChapterId(outline))}/outline`,
      outline,
    )
  }

  allowChapterLines(
    outline: ChapterOutline,
    offset: number,
    limit: number,
    lines: readonly Line[],
  ): this {
    const page: LinesPageDto = {
      total: lines.length,
      offset,
      limit,
      lines: lines.slice(offset, offset + limit).map(toLineDto),
      revision: outline.revision,
    }
    return this.allowGet(
      `${linesUrl(outline)}?offset=${offset}&limit=${limit}&revision=${outline.revision}`,
      page,
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

  allowAllChapterLines(outline: ChapterOutline, lines: readonly Line[]): this {
    _.range(lines.length).forEach((offset) =>
      _.range(1, 4).forEach((limit) =>
        this.allowChapterLines(outline, offset, limit, lines),
      ),
    )
    return this
  }

  expectUpdateEditedLines(
    outline: ChapterOutline,
    update: LinesUpdateDto,
    savedOutline: ChapterOutline,
  ): this {
    return this.expectOutlineUpdate(outline, 'lines', update, savedOutline)
  }

  expectImportLines(
    outline: ChapterOutline,
    atf: string,
    savedOutline: ChapterOutline,
  ): this {
    return this.expectOutlineUpdate(outline, 'import', { atf }, savedOutline)
  }

  expectSaveManuscripts(
    outline: ChapterOutline,
    update: unknown,
    savedOutline: ChapterOutline,
  ): this {
    return this.expectOutlineUpdate(
      outline,
      'manuscripts',
      update,
      savedOutline,
    )
  }

  private expectOutlineUpdate(
    outline: ChapterOutline,
    endpoint: ChapterEndpoint,
    body: unknown,
    savedOutline: ChapterOutline,
  ): this {
    return this.expectPost(
      `${createChapterUrl(toChapterId(outline))}/${endpoint}?view=outline&revision=${outline.revision}`,
      body,
      savedOutline,
    )
  }
}
