import { Token } from './token'
import Reference from 'bibliography/domain/Reference'
import { ReferenceDto } from 'bibliography/domain/referenceDto'

export interface TextPart {
  readonly type: 'StringPart' | 'EmphasisPart'
  readonly text: string
}

export interface UrlPart {
  readonly type: 'UrlPart'
  readonly url: string
  readonly text: string
}

export interface LanguagePart {
  readonly type: 'LanguagePart'
  readonly language: 'AKKADIAN' | 'SUMERIAN' | 'EMESAL' | 'HITTIE'
  readonly tokens: readonly Token[]
}

export interface BibliographyPart {
  readonly type: 'BibliographyPart'
  readonly reference: ReferenceDto | Reference
}

export interface ParagraphPart {
  readonly type: 'ParagraphPart'
  readonly text: ''
}

export type MarkupPart =
  | TextPart
  | LanguagePart
  | BibliographyPart
  | UrlPart
  | ParagraphPart
