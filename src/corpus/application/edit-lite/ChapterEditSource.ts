import { toLineDto } from 'corpus/application/chapterDtoSerialization'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'

export type ChapterEditSourceKind = 'legacy' | 'api'

export type ChapterEditSourceMode = 'auto' | ChapterEditSourceKind

export type LineDto = ReturnType<typeof toLineDto>

export interface LineEditDto {
  readonly index: number
  readonly line: LineDto
}

export interface LinesUpdateDto {
  readonly new: readonly LineDto[]
  readonly deleted: readonly number[]
  readonly edited: readonly LineEditDto[]
}

export interface ChapterEditSource {
  readonly kind: ChapterEditSourceKind
  readonly canSave: boolean
  readonly diagnostics: readonly string[]
  loadOutline(signal?: AbortSignal): Promise<ChapterOutline>
  loadLines(
    offset: number,
    limit: number,
    signal?: AbortSignal,
  ): Promise<readonly Line[]>
  describeSave(index: number, draft: Line): LinesUpdateDto
  saveLine(index: number, original: Line, draft: Line): Promise<ChapterOutline>
}
