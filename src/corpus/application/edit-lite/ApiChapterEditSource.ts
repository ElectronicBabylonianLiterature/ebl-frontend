import ConcurrencyLimiter from 'common/utils/ConcurrencyLimiter'
import SerialQueue from 'common/utils/SerialQueue'
import {
  ChapterChange,
  ChapterEditSource,
  WordInstances,
} from 'corpus/application/edit-lite/ChapterEditSource'
import {
  lineNotReturnedMessage,
  numberedLineChangedMessage,
  outlineNotReturnedMessage,
} from 'corpus/application/edit-lite/chapterChangeMessages'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { toChapterUpdate } from 'corpus/application/edit-lite/chapterRequests'
import {
  areLinesEqual,
  toLineEditsDto,
} from 'corpus/application/edit-lite/lineEdits'
import {
  maximumLinesPerRequest,
  splitIntoRanges,
} from 'corpus/application/edit-lite/lineRanges'
import type TextService from 'corpus/application/TextService'
import { LineAlignment } from 'corpus/domain/alignment'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import { Line } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'
import Word from 'dictionary/domain/Word'
import {
  readAtCurrentRevision,
  readAtOneRevision,
  rejectRevisionConflict,
  RevisionRead,
  RevisionTracked,
  trackRevision,
} from 'corpus/application/edit-lite/revisionReads'
import { ChapterId } from 'transliteration/domain/chapter-id'

export type ApiChapterEditTextService = Pick<
  TextService,
  | 'findChapterOutline'
  | 'findChapterLines'
  | 'findLineSuggestions'
  | 'searchDictionaryLemma'
  | 'createDictionaryProperNoun'
  | 'countWordInstances'
  | 'updateEditedLines'
  | 'updateChapterOutline'
>

export { maximumLinesPerRequest }
export const maximumConcurrentLineRequests = 3
export const savingNotPermittedMessage =
  'You do not have permission to save changes to this chapter.'

export class ApiChapterEditSource implements ChapterEditSource {
  private readonly lineRequestLimiter = new ConcurrencyLimiter(
    maximumConcurrentLineRequests,
  )
  private readonly saveQueue = new SerialQueue()
  private revision: string | undefined = undefined

  constructor(
    private readonly textService: ApiChapterEditTextService,
    private readonly id: ChapterId,
    private readonly canWrite: boolean,
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
    const readRanges = (): Promise<RevisionTracked<readonly Line[]>[]> =>
      Promise.all(
        splitIntoRanges(offset, limit).map((range) =>
          this.lineRequestLimiter.run(
            () =>
              this.readCurrent(
                trackRevision((revision) =>
                  this.findLines(range.offset, range.limit, signal, revision),
                ),
                signal,
              ),
            signal,
          ),
        ),
      )
    return readAtOneRevision(readRanges).then((pages) => pages.flat())
  }

  async loadAnnotatedLine(index: number): Promise<Line> {
    const [line] = await this.readCurrent((revision) =>
      this.textService.findChapterLines(this.id, index, 1, undefined, {
        revision,
        tokens: true,
      }),
    )
    if (line === undefined) {
      throw new Error(lineNotReturnedMessage)
    }
    return line
  }

  loadLemmatization(line: Line): Promise<readonly LineLemmatization[]> {
    return this.textService.findLineSuggestions(line)
  }

  searchLemma(query: string): Promise<readonly Word[]> {
    return this.textService.searchDictionaryLemma(query)
  }

  createProperNoun(lemma: string, namedEntityTag: string): Promise<Word> {
    return this.textService.createDictionaryProperNoun(lemma, namedEntityTag)
  }

  countWordInstances(word: string): Promise<WordInstances> {
    return this.readCurrent((revision) =>
      this.textService.countWordInstances(this.id, word, revision),
    )
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

  moveLine(from: number, to: number): Promise<ChapterOutline> {
    return this.apply({ type: 'moveLine', from, to })
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

  saveAlignment(
    index: number,
    alignment: LineAlignment,
  ): Promise<ChapterOutline> {
    return this.apply({ type: 'saveAlignment', index, alignment })
  }

  saveLemmatization(
    index: number,
    lemmatization: readonly LineLemmatization[],
  ): Promise<ChapterOutline> {
    return this.apply({ type: 'saveLemmatization', index, lemmatization })
  }

  lemmatizeWordInstances(
    word: string,
    lemmaIds: readonly string[],
  ): Promise<ChapterOutline> {
    return this.apply({ type: 'lemmatizeInstances', word, lemmaIds })
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
    return this.canWrite
      ? this.saveQueue.enqueue(save)
      : Promise.reject(new Error(savingNotPermittedMessage))
  }

  private async saveWhenCurrent(
    index: number,
    original: Line,
    draft: Line,
  ): Promise<ChapterOutline> {
    const [current] = await this.findLines(index, 1).catch(
      rejectRevisionConflict,
    )
    if (current === undefined || !areLinesEqual(current, original)) {
      throw new Error(numberedLineChangedMessage(original.number))
    }
    return this.textService
      .updateEditedLines(this.id, toLineEditsDto(index, draft), this.revision)
      .then((outline) => this.keepRevision(outline), rejectRevisionConflict)
  }

  private readCurrent<Result>(
    read: RevisionRead<Result>,
    signal?: AbortSignal,
  ): Promise<Result> {
    return readAtCurrentRevision(
      read,
      () => this.revision,
      () => this.saveQueue.settled(),
      signal,
    )
  }

  private findLines(
    offset: number,
    limit: number,
    signal?: AbortSignal,
    revision: string | undefined = this.revision,
  ): Promise<readonly Line[]> {
    return this.textService.findChapterLines(this.id, offset, limit, signal, {
      revision,
    })
  }

  private keepRevision(outline: ChapterOutline | null): ChapterOutline {
    if (typeof outline?.revision !== 'string') {
      throw new Error(outlineNotReturnedMessage)
    }
    this.revision = outline.revision
    return outline
  }
}

export default ApiChapterEditSource
