import { produce } from 'immer'
import { addBreves } from './accents'
import { AkkadianWord } from './token'

test('addBreves', () => {
  const word: AkkadianWord = {
    value: 'Huhuh',
    cleanValue: 'Huhuh',
    enclosureType: [],
    erasure: 'NONE',
    lemmatizable: true,
    alignable: true,
    alignment: null,
    variant: null,
    uniqueLemma: [],
    normalized: true,
    language: 'AKKADIAN',
    parts: [
      {
        value: 'Huh',
        cleanValue: 'Huh',
        enclosureType: [],
        erasure: 'NONE',
        type: 'ValueToken',
      },
      {
        value: 'huh',
        cleanValue: 'huh',
        enclosureType: [],
        erasure: 'NONE',
        type: 'ValueToken',
      },
    ],
    modifiers: [],
    type: 'AkkadianWord',
    hasVariantAlignment: false,
    hasOmittedAlignment: false,
  }

  expect(addBreves(word)).toEqual(
    produce(word, (draft) => {
      draft.parts[0].value = '\u1E2Au\u1E2B'
      draft.parts[1].value = '\u1E2Bu\u1E2B'
    }),
  )
})
