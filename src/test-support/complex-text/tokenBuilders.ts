import {
  Enclosure,
  Gloss,
  Joiner,
  NamedSign,
  Shift,
  Token,
  ValueToken,
  Word,
} from 'transliteration/domain/token'

export function valueToken(
  value: string,
  overrides?: Partial<ValueToken>,
): ValueToken {
  return {
    enclosureType: [],
    cleanValue: value,
    value,
    type: 'ValueToken',
    ...overrides,
  }
}

function namedSign(
  type: NamedSign['type'],
  value: string,
  name: string,
): NamedSign {
  return {
    enclosureType: [],
    cleanValue: value,
    value,
    name,
    nameParts: [valueToken(name)],
    subIndex: 1,
    modifiers: [],
    flags: [],
    sign: null,
    type,
  }
}

export function reading(
  value: string,
  name: string,
  overrides?: Partial<NamedSign>,
): NamedSign {
  return { ...namedSign('Reading', value, name), ...overrides }
}

export function logogram(
  value: string,
  name: string,
  overrides?: Partial<NamedSign>,
): NamedSign {
  return {
    ...namedSign('Logogram', value, name),
    surrogate: [],
    ...overrides,
  }
}

export function word(
  value: string,
  parts: readonly Token[],
  overrides?: Partial<Word>,
): Word {
  return {
    enclosureType: [],
    cleanValue: value,
    value,
    language: 'AKKADIAN',
    normalized: false,
    lemmatizable: true,
    alignable: true,
    uniqueLemma: [],
    erasure: 'NONE',
    alignment: null,
    variant: null,
    parts,
    type: 'Word',
    hasVariantAlignment: false,
    hasOmittedAlignment: false,
    ...overrides,
  }
}

export function joiner(value: string, overrides?: Partial<Joiner>): Joiner {
  return {
    enclosureType: [],
    cleanValue: value,
    value,
    type: 'Joiner',
    ...overrides,
  }
}

export function enclosure(
  type: Enclosure['type'],
  value: string,
  side: Enclosure['side'],
  overrides?: Partial<Enclosure>,
): Enclosure {
  return {
    enclosureType: [],
    cleanValue: '',
    value,
    side,
    type,
    ...overrides,
  }
}

export function gloss(
  type: Gloss['type'],
  value: string,
  parts: readonly Token[],
  overrides?: Partial<Gloss>,
): Gloss {
  return {
    enclosureType: [],
    cleanValue: value,
    value,
    parts,
    type,
    ...overrides,
  }
}

export function languageShift(
  value: string,
  language: string,
  overrides?: Partial<Shift>,
): Shift {
  return {
    enclosureType: [],
    cleanValue: value,
    value,
    language,
    normalized: false,
    type: 'LanguageShift',
    ...overrides,
  }
}
