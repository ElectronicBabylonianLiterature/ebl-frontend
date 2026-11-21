import _ from 'lodash'
import { ChapterAtfSnapshotDto } from 'corpus/application/edit-lite/chapterAtfSnapshot'
import {
  ChapterEndpoint,
  LinesUpdateDto,
} from 'corpus/application/edit-lite/ChapterEditSource'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import EditLiteFakeChapter, {
  toChapterId,
  toLinesPage,
} from 'corpus/ui/edit-lite/EditLiteFakeChapter.testSupport'
import FakeApi from 'test-support/FakeApi'
import { createChapterUrl, Dto } from 'test-support/FakeApiExpectation'
import { ChapterId } from 'transliteration/domain/chapter-id'

export interface ChapterRequests {
  readonly get: (path: string) => Promise<unknown>
  readonly post: (path: string, body: unknown) => Promise<unknown>
}

export function createChapterRequests(
  chapterId: ChapterId,
  findFakeApi: () => FakeApi,
): ChapterRequests {
  const chapterUrl = createChapterUrl(chapterId)
  return {
    get: (path) =>
      findFakeApi().client.fetchJson(`${chapterUrl}/${path}`, false),
    post: (path, body) =>
      findFakeApi().client.postJson(`${chapterUrl}/${path}`, body),
  }
}

function linesUrl(outline: ChapterOutline): string {
  return `${createChapterUrl(toChapterId(outline))}/lines`
}

function respondFirst(
  request: jest.Mock,
  respond: (path: string, body: unknown) => Promise<unknown> | null,
): void {
  const respondAsExpected = request.getMockImplementation() as (
    ...parameters: unknown[]
  ) => Promise<unknown>
  request.mockImplementation(
    (path: string, ...parameters: unknown[]) =>
      respond(path, parameters[0]) ?? respondAsExpected(path, ...parameters),
  )
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
    return this.allowGet(
      `${linesUrl(outline)}?offset=${offset}&limit=${limit}&revision=${outline.revision}`,
      toLinesPage(lines, offset, limit, outline.revision),
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

  serveChapter(chapter: EditLiteFakeChapter): this {
    respondFirst(this.client.fetchJson, (path) =>
      chapter.respond('GET', path, null),
    )
    respondFirst(this.client.postJson, (path, body) =>
      chapter.respond('POST', path, body),
    )
    return this
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
