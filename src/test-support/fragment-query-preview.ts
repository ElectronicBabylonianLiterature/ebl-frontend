import { TextLineDto } from 'transliteration/domain/text-line'
import { NamedSign, Token, Word } from 'transliteration/domain/token'
import { Fragment } from 'fragmentarium/domain/fragment'
import { createTransliteration } from 'transliteration/application/dtos'

export const SUMMARY_LEMMA_ID = 'testWordId'

export function valueToken(value: string): Token {
  return {
    type: 'ValueToken',
    value,
    cleanValue: value,
    enclosureType: [],
  } as Token
}

export function namedSign(
  type: NamedSign['type'],
  name: string,
  { flags = [] }: { flags?: readonly string[] } = {},
): Token {
  return {
    type,
    value: name,
    cleanValue: name,
    enclosureType: [],
    name,
    nameParts: [valueToken(name)],
    subIndex: 1,
    modifiers: [],
    flags,
    sign: null,
  } as unknown as Token
}

export function determinative(name: string): Token {
  return {
    type: 'Determinative',
    value: `{${name}}`,
    cleanValue: `{${name}}`,
    enclosureType: [],
    parts: [namedSign('Reading', name)],
  } as unknown as Token
}

export function word(
  value: string,
  parts: readonly Token[],
  uniqueLemma: readonly string[] = [],
): Word {
  return {
    type: 'Word',
    value,
    cleanValue: value,
    enclosureType: [],
    erasure: 'NONE',
    language: 'AKKADIAN',
    normalized: false,
    lemmatizable: uniqueLemma.length > 0,
    alignable: true,
    uniqueLemma,
    alignment: null,
    variant: null,
    hasVariantAlignment: false,
    hasOmittedAlignment: false,
    parts,
  } as Word
}

export function languageShift(language: string): Token {
  return {
    type: 'LanguageShift',
    value: `%${language.toLowerCase()}`,
    cleanValue: `%${language.toLowerCase()}`,
    enclosureType: [],
    normalized: false,
    language,
  } as unknown as Token
}

export function previewLine(
  number: number,
  content: readonly Token[],
): TextLineDto {
  return {
    type: 'TextLine',
    prefix: `${number}.`,
    lineNumber: {
      number,
      hasPrime: false,
      prefixModifier: null,
      suffixModifier: null,
      type: 'LineNumber',
    },
    content,
  }
}

export const readingWord = word(
  'kur',
  [namedSign('Reading', 'kur')],
  [SUMMARY_LEMMA_ID],
)

export const secondWord = word('ša', [namedSign('Reading', 'ša')])

export const summaryPreviewLines: readonly TextLineDto[] = [
  previewLine(1, [readingWord, secondWord]),
  previewLine(2, [word('ana', [namedSign('Reading', 'ana')])]),
]

export function withPreviewLines(
  fragment: Fragment,
  lines: readonly TextLineDto[] = summaryPreviewLines,
): Fragment {
  return Fragment.create({
    ...fragment,
    text: createTransliteration({ lines }),
  })
}

export const scholarlyPreviewLine = previewLine(1, [
  word('kur', [namedSign('Reading', 'kur')], [SUMMARY_LEMMA_ID]),
  word('INANNA', [namedSign('Logogram', 'INANNA')]),
  word('{d}bil', [determinative('d'), namedSign('Reading', 'bil')]),
  word('bad', [namedSign('Reading', 'bad', { flags: ['#'] })]),
])
