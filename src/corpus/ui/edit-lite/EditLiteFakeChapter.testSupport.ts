import { toLineDto } from 'corpus/application/chapterDtoSerialization'
import { fromLineDto } from 'corpus/application/dtos'
import { LinesUpdateDto } from 'corpus/application/edit-lite/ChapterEditSource'
import {
  ChapterOutline,
  LinesPageDto,
} from 'corpus/application/edit-lite/chapterOutline'
import { toLineOutline } from 'corpus/application/edit-lite/legacySnapshot'
import { Line } from 'corpus/domain/line'
import {
  createAligner,
  createLemmatizer,
  keepTokens,
  toAnnotatedLineDto,
} from 'corpus/ui/edit-lite/EditLiteFakeAnnotations.testSupport'
import {
  parseMoveBody,
  rejectRequest,
} from 'corpus/ui/edit-lite/editLiteFakeRequests.testSupport'
import { moveItem } from 'corpus/ui/edit-lite/lineMove'
import { createChapterUrl } from 'test-support/FakeApiExpectation'
import { ChapterId } from 'transliteration/domain/chapter-id'

export type FakeChapterMethod = 'GET' | 'POST'

export function toLinesPage(
  lines: readonly Line[],
  offset: number,
  limit: number,
  revision: string,
  toDto: (line: Line) => Record<string, unknown> = toLineDto,
): LinesPageDto {
  return {
    total: lines.length,
    offset,
    limit,
    lines: lines.slice(offset, offset + limit).map(toDto),
    revision,
  }
}

type Route = (query: URLSearchParams, body: unknown) => unknown
type Annotation = 'alignment' | 'lemmatization'

export { invalidRequestMessage } from 'corpus/ui/edit-lite/editLiteFakeRequests.testSupport'

export const staleRevisionMessage =
  'The chapter has been changed since the given revision.'
export const missingRevisionMessage = 'revision is required'
export const emptyRevisionMessage =
  "revision must be a non-empty string, got '' instead"
export const samePositionMessage = 'The line is already at that position.'

const annotationRoute = /^lines\/(\d+)\/(alignment|lemmatization)$/
const annotators: Readonly<
  Record<Annotation, (body: unknown) => (line: Line) => Line>
> = { alignment: createAligner, lemmatization: createLemmatizer }

export function toChapterId(outline: ChapterOutline): ChapterId {
  return { textId: outline.textId, stage: outline.stage, name: outline.name }
}

export function positionOutOfRangeMessage(
  position: number,
  lineCount: number,
): string {
  return `Invalid line: ${position} is not a line position (number of lines: ${lineCount}).`
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
      ? this.findRoute(method, pathname.slice(this.url.length))
      : undefined
    return route === undefined
      ? null
      : new Promise((resolve) => resolve(route(searchParams, body)))
  }

  private findRoute(
    method: FakeChapterMethod,
    path: string,
  ): Route | undefined {
    const [, position, annotation] = annotationRoute.exec(path) ?? []
    return method === 'POST' && annotation !== undefined
      ? (query, body): ChapterOutline =>
          this.annotateLine(
            Number(position),
            annotation as Annotation,
            query,
            body,
          )
      : this.routes.get(`${method} ${path}`)
  }

  private findLines(query: URLSearchParams): LinesPageDto {
    const offset = Number(query.get('offset'))
    const limit = Number(query.get('limit'))
    this.checkRevision(query)
    return toLinesPage(
      this.storedLines,
      offset,
      limit,
      this.revision,
      query.get('tokens') === 'true' ? toAnnotatedLineDto : toLineDto,
    )
  }

  private updateLines(
    query: URLSearchParams,
    update: LinesUpdateDto,
  ): ChapterOutline {
    const editedLines = new Map<number, Line>(
      update.edited.map(({ index, line }) => [
        index,
        keepTokens(this.storedLines[index], fromLineDto(line)),
      ]),
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
    const { from, to } = parseMoveBody(body)
    const lineCount = this.storedLines.length
    const outOfRange = [from, to].find((position) => position >= lineCount)
    this.requireRevision(query, missingRevisionMessage)
    if (outOfRange !== undefined) {
      rejectRequest(positionOutOfRangeMessage(outOfRange, lineCount), 422)
    }
    if (from === to) {
      rejectRequest(samePositionMessage, 422)
    }
    return this.store(moveItem(this.storedLines, from, to))
  }

  private annotateLine(
    position: number,
    annotation: Annotation,
    query: URLSearchParams,
    body: unknown,
  ): ChapterOutline {
    const annotate = annotators[annotation](body)
    const lineCount = this.storedLines.length
    this.requireRevision(query, missingRevisionMessage)
    if (position >= lineCount) {
      rejectRequest(positionOutOfRangeMessage(position, lineCount), 422)
    }
    return this.store(
      this.storedLines.map((line, index) =>
        index === position ? annotate(line) : line,
      ),
    )
  }

  private requireRevision(query: URLSearchParams, message: string): void {
    if (!query.has('revision')) {
      rejectRequest(message, 422)
    }
    this.checkRevision(query)
  }

  private checkRevision(query: URLSearchParams): void {
    const revision = query.get('revision')
    if (revision === '') {
      rejectRequest(emptyRevisionMessage, 422)
    }
    if (revision !== null && revision !== this.revision) {
      rejectRequest(staleRevisionMessage, 409)
    }
  }

  private store(lines: readonly Line[]): ChapterOutline {
    this.storedLines = lines
    this.revisionNumber += 1
    return this.outline
  }
}
