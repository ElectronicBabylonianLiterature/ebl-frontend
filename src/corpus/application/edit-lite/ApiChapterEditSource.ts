import ConcurrencyLimiter from 'common/utils/ConcurrencyLimiter'
import SerialQueue from 'common/utils/SerialQueue'
import {
  ChapterChange,
  ChapterEditSource,
  ChapterEditSourceKind,
  ChapterRequest,
  LinesUpdateDto,
} from 'corpus/application/edit-lite/ChapterEditSource'
import {
  chapterChangedMessage,
  numberedLineChangedMessage,
} from 'corpus/application/edit-lite/chapterChangeMessages'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import {
  describeChapterChange,
  toChapterUpdate,
} from 'corpus/application/edit-lite/chapterRequests'
import {
  areLinesEqual,
  toLineEditsDto,
} from 'corpus/application/edit-lite/lineEdits'
import type TextService from 'corpus/application/TextService'
import { Line } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'
import { ApiError } from 'http/ApiClient'
import { ChapterId } from 'transliteration/domain/chapter-id'

export type ApiChapterEditTextService = Pick<
  TextService,
  | 'findChapterOutline'
  | 'findChapterLines'
  | 'updateEditedLines'
  | 'updateChapterOutline'
>

export const maximumLinesPerRequest = 10
export const maximumConcurrentLineRequests = 3
export const savingNotPermittedMessage =
  'You do not have permission to save changes to this chapter.'

interface LineRange {
  readonly offset: number
  readonly limit: number
}

function splitIntoRanges(offset: number, limit: number): LineRange[] {
  const ranges: LineRange[] = []
  for (
    let rangeOffset = offset;
    rangeOffset < offset + limit;
    rangeOffset += maximumLinesPerRequest
  ) {
    ranges.push({
      offset: rangeOffset,
      limit: Math.min(maximumLinesPerRequest, offset + limit - rangeOffset),
    })
  }
  return ranges
}

function rejectRevisionConflict(error: unknown): never {
  throw error instanceof ApiError && error.status === 409
    ? new Error(chapterChangedMessage)
    : error
}

export class ApiChapterEditSource implements ChapterEditSource {
  readonly kind: ChapterEditSourceKind = 'api'
  readonly diagnostics: readonly string[] = []
  private readonly lineRequestLimiter = new ConcurrencyLimiter(
    maximumConcurrentLineRequests,
  )
  private readonly saveQueue = new SerialQueue()
  private revision: string | undefined = undefined

  constructor(
    private readonly textService: ApiChapterEditTextService,
    private readonly id: ChapterId,
    readonly canSave: boolean,
  ) {}

  loadOutline(signal?: AbortSignal): Promise<ChapterOutline> {
    return this.textService
      .findChapterOutline(this.id, signal)
      .then((outline) => this.keepRevision(outline))
  }

  loadLines(
    offset: number,
    limit: number,
    signal?: AbortSignal,
  ): Promise<readonly Line[]> {
    return Promise.all(
      splitIntoRanges(offset, limit).map((range) =>
        this.lineRequestLimiter.run(
          () => this.findLines(range.offset, range.limit, signal),
          signal,
        ),
      ),
    ).then((pages) => pages.flat())
  }

  describeSave(index: number, draft: Line): LinesUpdateDto {
    return toLineEditsDto(index, draft)
  }

  describeChange(change: ChapterChange): ChapterRequest {
    return describeChapterChange(this.id, change, this.revision)
  }

  saveLine(
    index: number,
    original: Line,
    draft: Line,
  ): Promise<ChapterOutline> {
    return this.enqueue(() => this.saveWhenCurrent(index, original, draft))
  }

  addLine(line: Line): Promise<ChapterOutline> {
    return this.apply({ type: 'addLine', line })
  }

  deleteLine(index: number): Promise<ChapterOutline> {
    return this.apply({ type: 'deleteLine', index })
  }

  importLines(atf: string): Promise<ChapterOutline> {
    return this.apply({ type: 'importLines', atf })
  }

  saveManuscripts(
    manuscripts: readonly Manuscript[],
    uncertainFragments: readonly string[],
  ): Promise<ChapterOutline> {
    return this.apply({
      type: 'saveManuscripts',
      manuscripts,
      uncertainFragments,
    })
  }

  private apply(change: ChapterChange): Promise<ChapterOutline> {
    return this.enqueue(() => {
      const { endpoint, body } = toChapterUpdate(change)
      return this.textService
        .updateChapterOutline(this.id, endpoint, body, this.revision)
        .then((outline) => this.keepRevision(outline), rejectRevisionConflict)
    })
  }

  private enqueue(
    save: () => Promise<ChapterOutline>,
  ): Promise<ChapterOutline> {
    return this.canSave
      ? this.saveQueue.enqueue(save)
      : Promise.reject(new Error(savingNotPermittedMessage))
  }

  private async saveWhenCurrent(
    index: number,
    original: Line,
    draft: Line,
  ): Promise<ChapterOutline> {
    const [current] = await this.findLines(index, 1)
    if (current === undefined || !areLinesEqual(current, original)) {
      throw new Error(numberedLineChangedMessage(original.number))
    }
    return this.textService
      .updateEditedLines(
        this.id,
        this.describeSave(index, draft),
        this.revision,
      )
      .then((outline) => this.keepRevision(outline), rejectRevisionConflict)
  }

  private findLines(
    offset: number,
    limit: number,
    signal?: AbortSignal,
  ): Promise<readonly Line[]> {
    return this.textService
      .findChapterLines(this.id, offset, limit, signal, this.revision)
      .catch(rejectRevisionConflict)
  }

  private keepRevision(outline: ChapterOutline): ChapterOutline {
    this.revision = outline.revision
    return outline
  }
}

export default ApiChapterEditSource
