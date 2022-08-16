import { createManuscriptLine } from './line'
import {
  NamedSign,
  UnknownSign,
  UnknownNumberOfSigns,
  Word,
  Token,
} from 'transliteration/domain/token'

function makeReading(value: string): NamedSign {
  return {
    enclosureType: [],
    cleanValue: value,
    value: value,
    name: value,
    nameParts: [
      {
        enclosureType: [],
        cleanValue: value,
        value: value,
        type: 'ValueToken',
      },
    ],
    subIndex: 1,
    modifiers: [],
    flags: [],
    sign: null,
    type: 'Reading',
  }
}

const reading: NamedSign = makeReading('ra')

function makeAtfToken(
  token: NamedSign | UnknownSign | UnknownNumberOfSigns
): Token {
  return {
    type: 'Word',
    value: token.value,
    parts: [token],
    cleanValue: token.cleanValue,
    uniqueLemma: [],
    normalized: false,
    language: 'AKKADIAN',
    lemmatizable: true,
    alignable: true,
    erasure: 'NONE',
    alignment: null,
    variant: null,
    enclosureType: [],
    hasVariantAlignment: false,
    hasOmittedAlignment: false,
  }
}

const unclearSign: UnknownSign = {
  enclosureType: [],
  cleanValue: 'x',
  value: 'x',
  flags: [],
  type: 'UnclearSign',
}

const lineBreak: Token = {
  enclosureType: [],
  cleanValue: '|',
  value: '|',
  type: 'LineBreak',
}

const unknownNumberOfSigns: UnknownNumberOfSigns = {
  enclosureType: [],
  cleanValue: '...',
  value: '...',
  type: 'UnknownNumberOfSigns',
}

test.each([
  [reading, false],
  [unclearSign, true],
  [unknownNumberOfSigns, true],
])('beginsWithLacuna', (token, expected) => {
  const line = createManuscriptLine({
    atfTokens: [lineBreak, makeAtfToken(token)],
  })

  expect(line.beginsWithLacuna).toBe(expected)
})

test.each([
  [reading, false],
  [unclearSign, true],
  [unknownNumberOfSigns, true],
])('endsWithLacuna', (token, expected) => {
  const line = createManuscriptLine({
    atfTokens: [makeAtfToken(token), lineBreak],
  })

  expect(line.endsWithLacuna).toBe(expected)
})

test('findMatchingWords', () => {
  const query: Word = makeAtfToken(reading) as Word
  const line = createManuscriptLine({
    atfTokens: [unclearSign, query, makeReading('kur')],
  })

  expect(line.findMatchingWords(query)).toEqual([1])
})
