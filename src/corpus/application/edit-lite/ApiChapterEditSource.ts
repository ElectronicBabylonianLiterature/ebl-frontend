import ConcurrencyLimiter from 'common/utils/ConcurrencyLimiter'
import SerialQueue from 'common/utils/SerialQueue'
import {
  ChapterEditSource,
  ChapterEditSourceKind,
  LinesUpdateDto,
} from 'corpus/application/edit-lite/ChapterEditSource'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import {
  areLinesEqual,
  toLineEditsDto,
} from 'corpus/application/edit-lite/lineEdits'
import type TextService from 'corpus/application/TextService'
import { Line } from 'corpus/domain/line'
import { ChapterId } from 'transliteration/domain/chapter-id'

export type ApiChapterEditTextService = Pick<
  TextService,
  'findChapterOutline' | 'findChapterLines' | 'updateEditedLines'
>

export const maximumLinesPerRequest = 10
export const maximumConcurrentLineRequests = 3

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

export class ApiChapterEditSource implements ChapterEditSource {
  readonly kind: ChapterEditSourceKind = 'api'
  readonly diagnostics: readonly string[] = []
  private readonly lineRequestLimiter = new ConcurrencyLimiter(
    maximumConcurrentLineRequests,
  )
  private readonly saveQueue = new SerialQueue()

  constructor(
    private readonly textService: ApiChapterEditTextService,
    private readonly id: ChapterId,
    readonly canSave: boolean,
  ) {}

  loadOutline(signal?: AbortSignal): Promise<ChapterOutline> {
    return this.textService.findChapterOutline(this.id, signal)
  }

  loadLines(
    offset: number,
    limit: number,
    signal?: AbortSignal,
  ): Promise<readonly Line[]> {
    return Promise.all(
      splitIntoRanges(offset, limit).map((range) =>
        this.lineRequestLimiter.run(
          () =>
            this.textService.findChapterLines(
              this.id,
              range.offset,
              range.limit,
              signal,
            ),
          signal,
        ),
      ),
    ).then((pages) => pages.flat())
  }

  describeSave(index: number, draft: Line): LinesUpdateDto {
    return toLineEditsDto(index, draft)
  }

  saveLine(
    index: number,
    original: Line,
    draft: Line,
  ): Promise<ChapterOutline> {
    return this.canSave
      ? this.saveQueue.enqueue(() =>
          this.saveWhenCurrent(index, original, draft),
        )
      : Promise.reject(
          new Error(
            'You do not have permission to save changes to this chapter.',
          ),
        )
  }

  private async saveWhenCurrent(
    index: number,
    original: Line,
    draft: Line,
  ): Promise<ChapterOutline> {
    const [current] = await this.textService.findChapterLines(this.id, index, 1)
    if (current === undefined || !areLinesEqual(current, original)) {
      throw new Error(
        `Line ${original.number} has changed on the server since it was loaded. Reload the chapter and apply your changes again.`,
      )
    }
    return this.textService.updateEditedLines(
      this.id,
      this.describeSave(index, draft),
    )
  }
}

export default ApiChapterEditSource
