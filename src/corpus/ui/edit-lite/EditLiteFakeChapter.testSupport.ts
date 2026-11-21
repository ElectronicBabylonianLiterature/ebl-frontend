import { toLineDto } from 'corpus/application/chapterDtoSerialization'
import { fromLineDto } from 'corpus/application/dtos'
import {
  LineMoveDto,
  LinesUpdateDto,
} from 'corpus/application/edit-lite/ChapterEditSource'
import {
  ChapterOutline,
  LinesPageDto,
} from 'corpus/application/edit-lite/chapterOutline'
import { toLineOutline } from 'corpus/application/edit-lite/legacySnapshot'
import { Line } from 'corpus/domain/line'
import { moveItem } from 'corpus/ui/edit-lite/lineMove'
import { ApiError } from 'http/ApiClient'
import { createChapterUrl } from 'test-support/FakeApiExpectation'
import { ChapterId } from 'transliteration/domain/chapter-id'

export type FakeChapterMethod = 'GET' | 'POST'

export function toLinesPage(
  lines: readonly Line[],
  offset: number,
  limit: number,
  revision: string,
): LinesPageDto {
  return {
    total: lines.length,
    offset,
    limit,
    lines: lines.slice(offset, offset + limit).map(toLineDto),
    revision,
  }
}

type Route = (query: URLSearchParams, body: unknown) => unknown

export const staleRevisionMessage =
  'The chapter has been changed since the given revision.'
export const invalidRequestMessage = 'Request data failed validation'
export const missingRevisionMessage = 'A revision is required to move a line.'
export const emptyRevisionMessage =
  "revision must be a non-empty string, got '' instead"
export const samePositionMessage = 'The line is already at that position.'

export function toChapterId(outline: ChapterOutline): ChapterId {
  return { textId: outline.textId, stage: outline.stage, name: outline.name }
}

function reject(message: string, status: number): never {
  throw new ApiError(message, { description: message }, status)
}

function isPosition(value: unknown): boolean {
  return Number.isInteger(value) && Number(value) >= 0
}

function parseMove(body: unknown): LineMoveDto {
  const { from, to, ...unknownFields } = Object(body) as Record<string, unknown>
  const isValid =
    isPosition(from) &&
    isPosition(to) &&
    Object.keys(unknownFields).length === 0
  return isValid
    ? { from: Number(from), to: Number(to) }
    : reject(invalidRequestMessage, 400)
}

export function positionOutOfRangeMessage(
  position: number,
  lineCount: number,
): string {
  return `Position ${position} is out of range: the chapter has ${lineCount} lines.`
}

export default class EditLiteFakeChapter {
  private storedLines: readonly Line[]
  private revisionNumber = 1
  private readonly url: string
  private readonly routes: ReadonlyMap<string, Route> = new Map<string, Route>([
    ['GET outline', (): ChapterOutline => this.outline],
    ['GET lines', (query): LinesPageDto => this.findLines(query)],
    [
      'POST lines',
      (query, body): ChapterOutline =>
        this.updateLines(query, body as LinesUpdateDto),
    ],
    [
      'POST lines/move',
      (query, body): ChapterOutline => this.moveLine(query, body),
    ],
  ])

  constructor(
    private readonly chapter: ChapterOutline,
    lines: readonly Line[],
  ) {
    this.storedLines = lines
    this.url = `${createChapterUrl(toChapterId(chapter))}/`
  }

  get lines(): readonly Line[] {
    return this.storedLines
  }

  get revision(): string {
    return `revision-${this.revisionNumber}`
  }

  get outline(): ChapterOutline {
    return {
      ...this.chapter,
      lines: this.storedLines.map(toLineOutline),
      revision: this.revision,
    }
  }

  respond(
    method: FakeChapterMethod,
    path: string,
    body: unknown,
  ): Promise<unknown> | null {
    const { pathname, searchParams } = new URL(path, 'http://localhost')
    const isServed =
      pathname.startsWith(this.url) &&
      (method === 'GET' || searchParams.get('view') === 'outline')
    const route = isServed
      ? this.routes.get(`${method} ${pathname.slice(this.url.length)}`)
      : undefined
    return route === undefined
      ? null
      : new Promise((resolve) => resolve(route(searchParams, body)))
  }

  private findLines(query: URLSearchParams): LinesPageDto {
    const offset = Number(query.get('offset'))
    const limit = Number(query.get('limit'))
    this.checkRevision(query)
    return toLinesPage(this.storedLines, offset, limit, this.revision)
  }

  private updateLines(
    query: URLSearchParams,
    update: LinesUpdateDto,
  ): ChapterOutline {
    const editedLines = new Map<number, Line>(
      update.edited.map(({ index, line }) => [index, fromLineDto(line)]),
    )
    this.checkRevision(query)
    return this.store([
      ...this.storedLines
        .map((line, index) => editedLines.get(index) ?? line)
        .filter((_line, index) => !update.deleted.includes(index)),
      ...update.new.map(fromLineDto),
    ])
  }

  private moveLine(query: URLSearchParams, body: unknown): ChapterOutline {
    const { from, to } = parseMove(body)
    const lineCount = this.storedLines.length
    const outOfRange = [from, to].find((position) => position >= lineCount)
    if (!query.has('revision')) {
      reject(missingRevisionMessage, 422)
    }
    this.checkRevision(query)
    if (outOfRange !== undefined) {
      reject(positionOutOfRangeMessage(outOfRange, lineCount), 422)
    }
    if (from === to) {
      reject(samePositionMessage, 422)
    }
    return this.store(moveItem(this.storedLines, from, to))
  }

  private checkRevision(query: URLSearchParams): void {
    const revision = query.get('revision')
    if (revision === '') {
      reject(emptyRevisionMessage, 422)
    }
    if (revision !== null && revision !== this.revision) {
      reject(staleRevisionMessage, 409)
    }
  }

  private store(lines: readonly Line[]): ChapterOutline {
    this.storedLines = lines
    this.revisionNumber += 1
    return this.outline
  }
}
