import {
  toLineAlignmentDto,
  toLineDto,
  toLineLemmatizationDto,
  toManuscriptsDto,
} from 'corpus/application/chapterDtoSerialization'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { LineAlignment } from 'corpus/domain/alignment'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import { Line } from 'corpus/domain/line'
import { Manuscript } from 'corpus/domain/manuscript'
import Word from 'dictionary/domain/Word'

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

export interface LineAlignmentDto {
  readonly alignment: ReturnType<typeof toLineAlignmentDto>
}

export interface LineLemmatizationDto {
  readonly lemmatization: ReturnType<typeof toLineLemmatizationDto>
}

export type LineAnnotationEndpoint =
  | `lines/${number}/alignment`
  | `lines/${number}/lemmatization`

export type ChapterEndpoint =
  | 'lines'
  | 'lines/move'
  | 'import'
  | 'manuscripts'
  | 'lemmatization/instances'
  | LineAnnotationEndpoint

export interface WordInstancesLemmaDto {
  readonly word: string
  readonly uniqueLemma: readonly string[]
}

export interface WordInstances {
  readonly word: string
  readonly words: number
  readonly lemmatized: number
  readonly lines: readonly number[]
  readonly revision: string
}

export type ChapterRequestBody =
  | LinesUpdateDto
  | LineMoveDto
  | LinesImportDto
  | ManuscriptsUpdateDto
  | LineAlignmentDto
  | LineLemmatizationDto
  | WordInstancesLemmaDto

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
  | {
      readonly type: 'saveAlignment'
      readonly index: number
      readonly alignment: LineAlignment
    }
  | {
      readonly type: 'saveLemmatization'
      readonly index: number
      readonly lemmatization: readonly LineLemmatization[]
    }
  | {
      readonly type: 'lemmatizeInstances'
      readonly word: string
      readonly lemmaIds: readonly string[]
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
  loadAnnotatedLine(index: number): Promise<Line>
  loadLemmatization(line: Line): Promise<readonly LineLemmatization[]>
  searchLemma(query: string): Promise<readonly Word[]>
  createProperNoun(lemma: string, namedEntityTag: string): Promise<Word>
  countWordInstances(word: string): Promise<WordInstances>
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
  saveAlignment(
    index: number,
    alignment: LineAlignment,
  ): Promise<ChapterOutline>
  saveLemmatization(
    index: number,
    lemmatization: readonly LineLemmatization[],
  ): Promise<ChapterOutline>
  lemmatizeWordInstances(
    word: string,
    lemmaIds: readonly string[],
  ): Promise<ChapterOutline>
}
