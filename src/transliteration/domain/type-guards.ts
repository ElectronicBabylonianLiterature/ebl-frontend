import {
  BibliographyPart,
  LanguagePart,
  Line,
  NoteLinePart,
  TextLine,
  NoteLine,
  ObjectAtLine,
  SurfaceAtLine,
  ColumnAtLine,
} from 'transliteration/domain/line'
import {
  CommentaryProtocol,
  Enclosure,
  Shift,
  Token,
  Word,
  Column,
} from 'transliteration/domain/token'

export function isEnclosure(token: Token): token is Enclosure {
  return [
    'BrokenAway',
    'PerhapsBrokenAway',
    'AccidentalOmission',
    'IntentionalOmission',
    'Removal',
    'Erasure',
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

export function isColumn(token: Token): token is Column {
  return token.type === 'Column'
}

export function isTextLine(line: Line): line is TextLine {
  return line.type === 'TextLine'
}

export function isLanguagePart(part: NoteLinePart): part is LanguagePart {
  return part.type === 'LanguagePart'
}

export function isBibliographyPart(
  part: NoteLinePart
): part is BibliographyPart {
  return part.type === 'BibliographyPart'
}

export function isNoteLine(line: Line): line is NoteLine {
  return line instanceof NoteLine
}

export function isObjectAtLine(line: Line): line is ObjectAtLine {
  return line.type === 'ObjectAtLine'
}

export function isSurfaceAtLine(line: Line): line is SurfaceAtLine {
  return line.type === 'SurfaceAtLine'
}

export function isColumnAtLine(line: Line): line is ColumnAtLine {
  return line.type === 'ColumnAtLine'
}
