export type EnclosureType =
  | 'ACCIDENTAL_OMISSION'
  | 'INTENTIONAL_OMISSION'
  | 'REMOVAL'
  | 'BROKEN_AWAY'
  | 'PERHAPS_BROKEN_AWAY'
  | 'PERHAPS'
  | 'EMENDATION'
  | 'DOCUMENT_ORIENTED_GLOSS'

export interface BaseToken {
  readonly type: string
  readonly value: string
  readonly cleanValue: string
  readonly parts?: readonly Token[]
  readonly erasure?: string
  readonly enclosureType: readonly EnclosureType[]
}

export interface NotLemmatizableToken extends BaseToken {
  readonly lemmatizable?: false
  readonly alignable?: false
  readonly uniqueLemma?: null
  readonly alignment?: null
}

export interface ValueToken extends NotLemmatizableToken {
  readonly type: 'ValueToken'
}

export interface Word extends BaseToken {
  readonly type: 'Word' | 'LoneDeterminative'
  readonly lemmatizable: boolean
  readonly alignable?: boolean
  readonly uniqueLemma: readonly string[]
  readonly alignment?: number | null
  readonly language: string
  readonly normalized: boolean
  readonly erasure: string
  readonly parts: readonly Token[]
}

export interface AkkadianWord extends BaseToken {
  readonly type: 'AkkadianWord'
  readonly parts: readonly Token[]
  readonly modifiers: readonly string[]
  readonly alignable: boolean
  readonly lemmatizable: boolean
  readonly uniqueLemma: readonly string[]
  readonly alignment: number | null
}

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

export interface Erasure extends NotLemmatizableToken {
  readonly type: 'Erasure'
  readonly side: string
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
}

export interface Gloss extends NotLemmatizableToken {
  readonly type: 'Determinative' | 'PhoneticGloss' | 'LinguisticGloss'
  readonly parts: readonly Token[]
}

export interface Tabulation extends NotLemmatizableToken {
  readonly type: 'Tabulation'
  readonly value: '($___$)'
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
  | Word
  | AkkadianWord
  | Break
  | Shift
  | Erasure
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
  | Tabulation
  | CommentaryProtocol
  | Column
