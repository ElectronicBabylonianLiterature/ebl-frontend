import { ReferenceDto } from 'bibliography/domain/referenceDto'
import {
  ChapterDisplay,
  LineDisplay,
  LineVariantDisplay,
} from 'corpus/domain/chapter'
import { Extent } from 'transliteration/domain/translation-line'
import { MarkupPart } from 'transliteration/domain/markup'
import { Token } from 'transliteration/domain/token'
import { NoteLineDto } from 'transliteration/domain/note-line'
import { ParallelLineDto } from 'transliteration/domain/parallel-line'

export type LineVariantDisplayDto = Pick<
  LineVariantDisplay,
  'originalIndex' | 'reconstruction' | 'manuscripts' | 'intertext'
> & {
  note: Omit<NoteLineDto, 'type'> | null
  parallelLines: ParallelLineDto[]
}

export type OldLineNumberDto = {
  number: string
  reference: ReferenceDto
}

export type LineDisplayDto = Pick<
  LineDisplay,
  | 'number'
  | 'isSecondLineOfParallelism'
  | 'isBeginningOfSection'
  | 'originalIndex'
> & {
  translation: {
    language: string
    extent: Extent | null
    parts: MarkupPart[]
    content: Token[]
  }[]
  variants: LineVariantDisplayDto[]
  oldLineNumbers: OldLineNumberDto[]
}

export type ChapterDisplayDto = Pick<
  ChapterDisplay,
  | 'id'
  | 'textHasDoi'
  | 'textName'
  | 'isSingleStage'
  | 'title'
  | 'record'
  | 'atf'
> & { lines: LineDisplayDto[] }
