import {
  ChapterEditSource,
  ChapterEditSourceKind,
  LinesUpdateDto,
} from 'corpus/application/edit-lite/ChapterEditSource'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import {
  createLegacySnapshot,
  LegacySnapshot,
} from 'corpus/application/edit-lite/legacySnapshot'
import { toLineEditsDto } from 'corpus/application/edit-lite/lineEdits'
import type TextService from 'corpus/application/TextService'
import { Line } from 'corpus/domain/line'
import { ChapterId } from 'transliteration/domain/chapter-id'

export type LegacyChapterEditTextService = Pick<
  TextService,
  'findChapterAtfSnapshot'
>

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

  describeSave(index: number, draft: Line): LinesUpdateDto {
    return toLineEditsDto(index, draft)
  }

  saveLine(): Promise<ChapterOutline> {
    return Promise.reject(
      new Error(
        'Saving is not available: this chapter was loaded as a read-only ATF snapshot.',
      ),
    )
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
