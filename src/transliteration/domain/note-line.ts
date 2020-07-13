import { Token } from './token'
import Reference from 'bibliography/domain/Reference'
import { AbstractLine, LineBaseDto } from './abstract-line'

export interface TextPart {
  readonly type: 'StringPart' | 'EmphasisPart'
  readonly text: string
}

export interface LanguagePart {
  readonly type: 'LanguagePart'
  readonly language: 'AKKADIAN' | 'SUMERIAN' | 'EMESAL'
  readonly tokens: readonly Token[]
}

export interface ReferenceDto {
  readonly id: string
  readonly type: 'DISCUSSION'
  readonly pages: string
  readonly notes: ''
  readonly linesCited: []
}

export interface BibliographyPart {
  readonly type: 'BibliographyPart'
  readonly reference: ReferenceDto | Reference
}

export type NoteLinePart = TextPart | LanguagePart | BibliographyPart

export interface NoteLineDto extends LineBaseDto {
  readonly type: 'NoteLine'
  readonly prefix: '#note: '
  readonly parts: readonly NoteLinePart[]
}

export class NoteLine extends AbstractLine {
  readonly type = 'NoteLine'
  readonly parts: readonly NoteLinePart[]

  constructor(data: NoteLineDto) {
    super('#note: ', data.content)
    this.parts = data.parts
  }
}
