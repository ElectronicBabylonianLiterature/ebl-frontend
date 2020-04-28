import {
  CommentaryProtocol,
  Enclosure,
  Shift,
  Token,
} from 'fragmentarium/domain/token'
import { Line, TextLine } from 'fragmentarium/domain/text'

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

export function isTextLine(line: Line): line is TextLine {
  return line.type === 'TextLine'
}
