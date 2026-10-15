import { createManuscriptLine } from 'corpus/domain/line'
import {
  NamedSign,
  UnknownSign,
  UnknownNumberOfSigns,
  Word,
  Token,
} from 'transliteration/domain/token'
import { atfToken, raToken } from 'test-support/test-tokens'

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
  token: NamedSign | UnknownSign | UnknownNumberOfSigns,
): Word {
  return {
    ...atfToken,
    value: token.value,
    parts: [token],
    cleanValue: token.cleanValue,
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
  const query: Word = makeAtfToken(reading)
  const line = createManuscriptLine({
    atfTokens: [unclearSign, query, makeReading('kur')],
  })

  expect(line.findMatchingWords(query)).toEqual([1])
})

test('an Akkadian word is not a lacuna', () => {
  const line = createManuscriptLine({ atfTokens: [raToken] })

  expect(line.beginsWithLacuna).toBe(false)
  expect(line.endsWithLacuna).toBe(false)
})

test('maps words from the left when the line ends with a lacuna', () => {
  const line = createManuscriptLine({
    atfTokens: [lineBreak, makeAtfToken(reading), makeAtfToken(unclearSign)],
  })

  expect(line.createAlignmentIndexMap(5)).toEqual([-1, 0, 1])
})

test('maps words from the right when the line does not end with a lacuna', () => {
  const line = createManuscriptLine({
    atfTokens: [makeAtfToken(reading), lineBreak, makeAtfToken(reading)],
  })

  expect(line.createAlignmentIndexMap(5)).toEqual([3, 4, 4])
})
