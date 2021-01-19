import { createManuscriptLine } from './text'
import {
  NamedSign,
  UnknownSign,
  UnknownNumberOfSigns,
} from 'transliteration/domain/token'

const reading: NamedSign = {
  enclosureType: [],
  cleanValue: 'ra',
  value: 'ra',
  name: 'ra',
  nameParts: [
    {
      enclosureType: [],
      cleanValue: 'ra',
      value: 'ra',
      type: 'ValueToken',
    },
  ],
  subIndex: 1,
  modifiers: [],
  flags: [],
  sign: null,
  type: 'Reading',
}

const unclearSign: UnknownSign = {
  enclosureType: [],
  cleanValue: 'x',
  value: 'x',
  flags: [],
  type: 'UnclearSign',
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
])('endsWithLacuna', (token, expected) => {
  const line = createManuscriptLine({
    atfTokens: [
      {
        type: 'Word',
        value: token.value,
        parts: [token],
        cleanValue: token.cleanValue,
        uniqueLemma: [],
        normalized: false,
        language: 'AKKADIAN',
        lemmatizable: true,
        erasure: 'NONE',
        alignment: null,
        variant: null,
        enclosureType: [],
      },
      {
        enclosureType: [],
        cleanValue: '|',
        value: '|',
        type: 'LineBreak',
      },
    ],
  })

  expect(line.endsWithLacuna).toBe(expected)
})
