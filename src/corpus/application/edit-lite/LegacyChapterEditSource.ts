import {
  ChapterChange,
  ChapterEditSource,
  ChapterEditSourceKind,
  ChapterRequest,
  LinesUpdateDto,
  WordInstances,
} from 'corpus/application/edit-lite/ChapterEditSource'
import { annotationsNotAvailableMessage } from 'corpus/application/edit-lite/chapterChangeMessages'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { describeChapterChange } from 'corpus/application/edit-lite/chapterRequests'
import {
  createLegacySnapshot,
  LegacySnapshot,
} from 'corpus/application/edit-lite/legacySnapshot'
import { toLineEditsDto } from 'corpus/application/edit-lite/lineEdits'
import type TextService from 'corpus/application/TextService'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import { Line } from 'corpus/domain/line'
import Word from 'dictionary/domain/Word'
import { ChapterId } from 'transliteration/domain/chapter-id'

export type LegacyChapterEditTextService = Pick<
  TextService,
  'findChapterAtfSnapshot'
>

export const savingNotAvailableMessage =
  'Saving is not available: this chapter was loaded as a read-only ATF snapshot.'

export class LegacyChapterEditSource implements ChapterEditSource {
  readonly kind: ChapterEditSourceKind = 'legacy'
  readonly canSave: boolean = false
  private snapshot: Promise<LegacySnapshot> | null = null
  private loadedDiagnostics: readonly string[] = []

  constructor(
    private readonly textService: LegacyChapterEditTextService,
    private readonly id: ChapterId,
  ) {}

  get diagnostics(): readonly string[] {
    return this.loadedDiagnostics
  }

  loadOutline(signal?: AbortSignal): Promise<ChapterOutline> {
    return this.loadSnapshot(signal).then((snapshot) => snapshot.outline)
  }

  loadLines(
    offset: number,
    limit: number,
    signal?: AbortSignal,
  ): Promise<readonly Line[]> {
    return this.loadSnapshot(signal).then((snapshot) =>
      snapshot.lines.slice(offset, offset + limit),
    )
  }

  loadAnnotatedLine(): Promise<Line> {
    return Promise.reject(new Error(annotationsNotAvailableMessage))
  }

  loadLemmatization(): Promise<readonly LineLemmatization[]> {
    return Promise.reject(new Error(annotationsNotAvailableMessage))
  }

  searchLemma(): Promise<readonly Word[]> {
    return Promise.resolve([])
  }

  createProperNoun(): Promise<Word> {
    return Promise.reject(new Error(savingNotAvailableMessage))
  }

  countWordInstances(): Promise<WordInstances> {
    return Promise.reject(new Error(annotationsNotAvailableMessage))
  }

  describeSave(index: number, draft: Line): LinesUpdateDto {
    return toLineEditsDto(index, draft)
  }

  describeChange(change: ChapterChange): ChapterRequest {
    return describeChapterChange(this.id, change)
  }

  saveLine(): Promise<ChapterOutline> {
    return this.refuseToSave()
  }

  addLine(): Promise<ChapterOutline> {
    return this.refuseToSave()
  }

  deleteLine(): Promise<ChapterOutline> {
    return this.refuseToSave()
  }

  moveLine(): Promise<ChapterOutline> {
    return this.refuseToSave()
  }

  importLines(): Promise<ChapterOutline> {
    return this.refuseToSave()
  }

  saveManuscripts(): Promise<ChapterOutline> {
    return this.refuseToSave()
  }

  saveAlignment(): Promise<ChapterOutline> {
    return this.refuseToSave()
  }

  saveLemmatization(): Promise<ChapterOutline> {
    return this.refuseToSave()
  }

  lemmatizeWordInstances(): Promise<ChapterOutline> {
    return this.refuseToSave()
  }

  private refuseToSave(): Promise<ChapterOutline> {
    return Promise.reject(new Error(savingNotAvailableMessage))
  }

  private loadSnapshot(signal?: AbortSignal): Promise<LegacySnapshot> {
    this.snapshot ??= this.fetchSnapshot(signal)
    return this.snapshot
  }

  private fetchSnapshot(signal?: AbortSignal): Promise<LegacySnapshot> {
    return this.textService
      .findChapterAtfSnapshot(this.id, signal)
      .then((dto) => {
        const snapshot = createLegacySnapshot(this.id, dto)
        this.loadedDiagnostics = snapshot.diagnostics
        return snapshot
      })
      .catch((error) => {
        this.snapshot = null
        throw error
      })
  }
}

export default LegacyChapterEditSource
