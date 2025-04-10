import _ from 'lodash'

export type EnclosureType =
  | 'ACCIDENTAL_OMISSION'
  | 'INTENTIONAL_OMISSION'
  | 'REMOVAL'
  | 'BROKEN_AWAY'
  | 'PERHAPS_BROKEN_AWAY'
  | 'PERHAPS'
  | 'EMENDATION'
  | 'DOCUMENT_ORIENTED_GLOSS'

export type ErasureType = 'NONE' | 'ERASED' | 'OVER_ERASED'

export interface BaseToken {
  readonly type: string
  readonly value: string
  readonly cleanValue: string
  readonly parts?: readonly Token[]
  readonly erasure?: ErasureType
  readonly enclosureType: readonly EnclosureType[]
  readonly sentenceIndex?: number
}

export interface NotLemmatizableToken extends BaseToken {
  readonly lemmatizable?: false
  readonly normalized?: boolean
  readonly uniqueLemma?: null
  readonly alignment?: null
}

export interface LemmatizableToken extends BaseToken {
  readonly parts: readonly Token[]
  readonly language: string
  readonly normalized: boolean
  readonly lemmatizable: boolean
  readonly alignable: boolean
  readonly uniqueLemma: readonly string[]
  readonly alignment: number | null
  readonly variant: Word | AkkadianWord | null
  readonly hasVariantAlignment: boolean
  readonly hasOmittedAlignment: boolean
}

export interface ValueToken extends NotLemmatizableToken {
  readonly type: 'ValueToken'
}

export interface Word extends LemmatizableToken {
  readonly type: 'Word' | 'LoneDeterminative'
  readonly erasure: ErasureType
  readonly normalized: false
}

export interface AkkadianWord extends LemmatizableToken {
  readonly type: 'AkkadianWord'
  readonly modifiers: readonly string[]
  readonly normalized: true
  readonly language: 'AKKADIAN'
}

export interface GreekWord extends LemmatizableToken {
  readonly type: 'GreekWord'
  readonly normalized: false
  readonly language: 'GREEK' | 'AKKADIAN' | 'SUMERIAN'
}

export type AnyWord = Word | AkkadianWord | GreekWord

export interface Break extends NotLemmatizableToken {
  readonly type: 'MetricalFootSeparator' | 'Caesura'
  readonly value: '|' | '(|)' | '||' | '(||)'
  readonly isUncertain: boolean
}

export interface Shift extends NotLemmatizableToken {
  readonly type: 'LanguageShift'
  readonly normalized: boolean
  readonly language: string
}

export interface Joiner extends NotLemmatizableToken {
  readonly type: 'Joiner'
}

export interface UnknownNumberOfSigns extends NotLemmatizableToken {
  readonly type: 'UnknownNumberOfSigns'
}

export interface UnknownSign extends NotLemmatizableToken {
  readonly type: 'UnidentifiedSign' | 'UnclearSign'
  readonly flags: readonly string[]
}

export interface Variant extends NotLemmatizableToken {
  readonly type: 'Variant' | 'Variant2'
  readonly tokens: readonly Token[]
}

export interface EgyptianMetricalFeetSeparator extends NotLemmatizableToken {
  readonly type: 'EgyptianMetricalFeetSeparator'
  readonly flags: readonly string[]
}

export interface Sign extends NotLemmatizableToken {
  readonly modifiers: readonly string[]
  readonly flags: readonly string[]
}

export interface NamedSign extends Sign {
  readonly type: 'Reading' | 'Logogram' | 'Number'
  readonly name: string
  readonly nameParts: readonly (ValueToken | Enclosure)[]
  readonly subIndex?: number | null
  readonly sign?: Token | null
  readonly surrogate?: readonly Token[] | null
}

export interface Divider extends Sign {
  readonly type: 'Divider'
  readonly divider: string
}

export interface GreekLetter extends NotLemmatizableToken {
  readonly type: 'GreekLetter' | 'UnclearSign'
  readonly letter: string
  readonly flags: readonly string[]
}

export interface LineBreak extends NotLemmatizableToken {
  readonly type: 'LineBreak'
  readonly value: '|'
}

export interface Grapheme extends Sign {
  readonly type: 'Grapheme'
  readonly name: string
}

export interface CompoundGrapheme extends NotLemmatizableToken {
  readonly type: 'CompoundGrapheme'
  // eslint-disable-next-line camelcase
  readonly compound_parts?: readonly string[]
}

export interface Gloss extends NotLemmatizableToken {
  readonly type: 'Determinative' | 'PhoneticGloss' | 'LinguisticGloss'
  readonly parts: readonly Token[]
}

export interface Tabulation extends NotLemmatizableToken {
  readonly type: 'Tabulation'
  readonly value: '($___$)'
}

export interface WordOmitted extends NotLemmatizableToken {
  readonly type: 'WordOmitted'
  readonly value: 'ø'
}

export interface Enclosure extends NotLemmatizableToken {
  readonly type:
    | 'BrokenAway'
    | 'PerhapsBrokenAway'
    | 'AccidentalOmission'
    | 'IntentionalOmission'
    | 'Removal'
    | 'Emendation'
    | 'Erasure'
    | 'DocumentOrientedGloss'
  readonly side: 'LEFT' | 'CENTER' | 'RIGHT'
}

export function isLeftSide(token: Enclosure): boolean {
  return token.side === 'LEFT'
}

export type Protocol = '!qt' | '!bs' | '!cm' | '!zz'
export interface CommentaryProtocol extends NotLemmatizableToken {
  readonly type: 'CommentaryProtocol'
  readonly value: Protocol
}

export interface Column extends NotLemmatizableToken {
  type: 'Column'
  number: number | null
}

export type Token =
  | ValueToken
  | Break
  | Shift
  | Joiner
  | UnknownNumberOfSigns
  | UnknownSign
  | Variant
  | NamedSign
  | Grapheme
  | Divider
  | LineBreak
  | CompoundGrapheme
  | Gloss
  | Enclosure
  | WordOmitted
  | Tabulation
  | CommentaryProtocol
  | Column
  | EgyptianMetricalFeetSeparator
  | GreekLetter
  | AnyWord

function extractEnclosureTypes(
  namedSign: NamedSign
): readonly (readonly EnclosureType[])[] {
  return namedSign.nameParts.map((part) => part.enclosureType)
}

export function effectiveEnclosure(namedSign: NamedSign): EnclosureType[] {
  return _.intersection(...extractEnclosureTypes(namedSign))
}

export function isStrictlyPartiallyEnclosed(
  namedSign: NamedSign,
  enclosure: EnclosureType
): boolean {
  return (
    _.union(...extractEnclosureTypes(namedSign)).includes(enclosure) &&
    !effectiveEnclosure(namedSign).includes(enclosure)
  )
}
