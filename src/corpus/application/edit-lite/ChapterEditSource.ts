import {
  toLineDto,
  toManuscriptsDto,
} from 'corpus/application/chapterDtoSerialization'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'

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

export interface LineMoveDto {
  readonly from: number
  readonly to: number
}

export interface LinesImportDto {
  readonly atf: string
}

export type ManuscriptsUpdateDto = ReturnType<typeof toManuscriptsDto>

export type ChapterEndpoint = 'lines' | 'lines/move' | 'import' | 'manuscripts'

export type ChapterRequestBody =
  | LinesUpdateDto
  | LineMoveDto
  | LinesImportDto
  | ManuscriptsUpdateDto

export type ChapterChange =
  | {
      readonly type: 'saveLine'
      readonly index: number
      readonly line: Line
    }
  | { readonly type: 'addLine'; readonly line: Line }
  | { readonly type: 'deleteLine'; readonly index: number }
  | { readonly type: 'moveLine'; readonly from: number; readonly to: number }
  | { readonly type: 'importLines'; readonly atf: string }
  | {
      readonly type: 'saveManuscripts'
      readonly manuscripts: readonly Manuscript[]
      readonly uncertainFragments: readonly string[]
    }

export interface ChapterRequest {
  readonly method: 'POST'
  readonly url: string
  readonly body: ChapterRequestBody
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
  describeChange(change: ChapterChange): ChapterRequest
  saveLine(index: number, original: Line, draft: Line): Promise<ChapterOutline>
  addLine(line: Line): Promise<ChapterOutline>
  deleteLine(index: number): Promise<ChapterOutline>
  moveLine(from: number, to: number): Promise<ChapterOutline>
  importLines(atf: string): Promise<ChapterOutline>
  saveManuscripts(
    manuscripts: readonly Manuscript[],
    uncertainFragments: readonly string[],
  ): Promise<ChapterOutline>
}
