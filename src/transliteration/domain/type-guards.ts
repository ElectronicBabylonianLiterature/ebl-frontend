import { TextLine } from 'transliteration/domain/text-line'
import {
  ObjectAtLine,
  SurfaceAtLine,
  ColumnAtLine,
} from 'transliteration/domain/at-lines'
import {
  BibliographyPart,
  LanguagePart,
  NoteLinePart,
  NoteLine,
} from 'transliteration/domain/note-line'
import {
  CommentaryProtocol,
  Enclosure,
  Shift,
  Token,
  Word,
  Column,
  AkkadianWord,
} from 'transliteration/domain/token'
import { AbstractLine } from './abstract-line'
import { EmptyLine } from 'transliteration/domain/line'

export function isEnclosure(token: Token): token is Enclosure {
  return [
    'BrokenAway',
    'PerhapsBrokenAway',
    'AccidentalOmission',
    'IntentionalOmission',
    'Removal',
    'Erasure',
    'Emendation',
  ].includes(token.type)
}

export function isDocumentOrientedGloss(token: Token): token is Enclosure {
  return token.type === 'DocumentOrientedGloss'
}

export function isShift(token: Token): token is Shift {
  return token.type === 'LanguageShift'
}

export function isCommentaryProtocol(
  token: Token
): token is CommentaryProtocol {
  return token.type === 'CommentaryProtocol'
}

export function isWord(token: Token): token is Word {
  return token.type === 'Word'
}

export function isAkkadianWord(token: Token): token is AkkadianWord {
  return token.type === 'AkkadianWord'
}

export function isAnyWord(token: Token): token is Word | AkkadianWord {
  return isWord(token) || isAkkadianWord(token)
}

export function isColumn(token: Token): token is Column {
  return token.type === 'Column'
}

export function isTextLine(line: AbstractLine): line is TextLine {
  return line instanceof TextLine
}

export function isEmptyLine(line: AbstractLine): line is EmptyLine {
  return line instanceof EmptyLine
}

export function isLanguagePart(part: NoteLinePart): part is LanguagePart {
  return part.type === 'LanguagePart'
}

export function isBibliographyPart(
  part: NoteLinePart
): part is BibliographyPart {
  return part.type === 'BibliographyPart'
}

export function isNoteLine(line: AbstractLine): line is NoteLine {
  return line instanceof NoteLine
}

export function isObjectAtLine(line: AbstractLine): line is ObjectAtLine {
  return line instanceof ObjectAtLine
}

export function isSurfaceAtLine(line: AbstractLine): line is SurfaceAtLine {
  return line instanceof SurfaceAtLine
}

export function isColumnAtLine(line: AbstractLine): line is ColumnAtLine {
  return line instanceof ColumnAtLine
}
