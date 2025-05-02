import { TextLine } from 'transliteration/domain/text-line'
import {
  ObjectAtLine,
  SurfaceAtLine,
  ColumnAtLine,
} from 'transliteration/domain/at-lines'
import { NoteLine } from 'transliteration/domain/note-line'
import {
  BibliographyPart,
  LanguagePart,
  MarkupPart,
  ParagraphPart,
  UrlPart,
} from 'transliteration/domain/markup'
import {
  CommentaryProtocol,
  Enclosure,
  Shift,
  Token,
  Word,
  Column,
  AkkadianWord,
  UnknownSign,
  UnknownNumberOfSigns,
  NamedSign,
  GreekWord,
  AnyWord,
  Break,
} from 'transliteration/domain/token'
import DictionaryWord from 'dictionary/domain/Word'
import _ from 'lodash'
import { AbstractLine } from './abstract-line'
import { EmptyLine } from 'transliteration/domain/line'
import { DollarLine } from './dollar-lines'
import {
  ParallelComposition,
  ParallelFragment,
  ParallelLine,
  ParallelText,
} from 'transliteration/domain/parallel-line'
import TranslationLine from 'transliteration/domain/translation-line'

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

export function isBreak(token: Token): token is Break {
  return ['MetricalFootSeparator', 'Caesura'].includes(token.type)
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

export function isGreekWord(token: Token): token is GreekWord {
  return token.type === 'GreekWord'
}

export function isAnyWord(token: Token): token is AnyWord {
  return isWord(token) || isAkkadianWord(token) || isGreekWord(token)
}

export function isNamedSign(token: Token): token is NamedSign {
  return ['Reading', 'Logogram', 'Number'].includes(token.type)
}

export function isSignToken(
  token: Token
): token is NamedSign | UnknownNumberOfSigns | UnknownSign {
  return (
    ['UnidentifiedSign', 'UnclearSign', 'UnknownNumberOfSigns'].includes(
      token.type
    ) || isNamedSign(token)
  )
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

export function isLanguagePart(part: MarkupPart): part is LanguagePart {
  return part.type === 'LanguagePart'
}

export function isBibliographyPart(part: MarkupPart): part is BibliographyPart {
  return part.type === 'BibliographyPart'
}

export function isUrlPart(part: MarkupPart): part is UrlPart {
  return part.type === 'UrlPart'
}

export function isParagraphPart(part: MarkupPart): part is ParagraphPart {
  return part.type === 'ParagraphPart'
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

export function isDollarLine(line: AbstractLine): line is DollarLine {
  return line instanceof DollarLine
}

export function isParallelLine(line: AbstractLine): line is ParallelLine {
  return (
    line instanceof ParallelFragment ||
    line instanceof ParallelText ||
    line instanceof ParallelComposition
  )
}

export function isTranslationLine(line: AbstractLine): line is TranslationLine {
  return line instanceof TranslationLine
}

export function isLemma(
  value: DictionaryWord | null | undefined
): value is DictionaryWord {
  return !_.isNil(value)
}
