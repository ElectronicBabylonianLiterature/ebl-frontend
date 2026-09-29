import { createManuscriptLine } from 'corpus/domain/line'
import { readingPart } from 'corpus/domain/LineVariant.testSupport'
import {
  NamedSign,
  UnknownSign,
  UnknownNumberOfSigns,
  Word,
  Token,
} from 'transliteration/domain/token'
import { atfToken } from 'test-support/test-tokens'

const reading: NamedSign = readingPart('ra')

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
    atfTokens: [unclearSign, query, readingPart('kur')],
  })

  expect(line.findMatchingWords(query)).toEqual([1])
})
