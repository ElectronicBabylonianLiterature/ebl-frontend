import {
  isBreak,
  isDollarLine,
  isEmptyLine,
  isNamedSign,
  isParallelLine,
  isSignToken,
} from 'transliteration/domain/type-guards'
import { breaks } from 'test-support/lines/text-normalized'
import { atfTokenRa, languageShiftToken } from 'test-support/test-tokens'
import empty from 'test-support/lines/empty'
import { UnknownNumberOfSigns } from 'transliteration/domain/token'
import { singleRuling } from 'test-support/lines/dollar'
import {
  composition,
  fragment,
  text as parallelText,
} from 'test-support/lines/parallel'

const [reading] = atfTokenRa.parts

test('isBreak recognises metrical breaks only', () => {
  expect(breaks.content.filter(isBreak).map((token) => token.type)).toEqual([
    'MetricalFootSeparator',
    'MetricalFootSeparator',
    'Caesura',
    'Caesura',
  ])
  expect(isBreak(languageShiftToken)).toBe(false)
})

test.each([
  [reading, true],
  [languageShiftToken, false],
])('isNamedSign %#', (token, expected) => {
  expect(isNamedSign(token)).toBe(expected)
  expect(isSignToken(token)).toBe(expected)
})

test('isSignToken accepts an unknown number of signs', () => {
  const unknownSigns: UnknownNumberOfSigns = {
    value: '...',
    cleanValue: '...',
    enclosureType: [],
    erasure: 'NONE',
    type: 'UnknownNumberOfSigns',
  }
  expect(isSignToken(unknownSigns)).toBe(true)
  expect(isNamedSign(unknownSigns)).toBe(false)
})

test.each([
  [empty, true, false, false],
  [singleRuling, false, true, false],
  [fragment, false, false, true],
  [parallelText, false, false, true],
  [composition, false, false, true],
])('line type guards %#', (line, emptyLine, dollarLine, parallelLine) => {
  expect(isEmptyLine(line)).toBe(emptyLine)
  expect(isDollarLine(line)).toBe(dollarLine)
  expect(isParallelLine(line)).toBe(parallelLine)
})
