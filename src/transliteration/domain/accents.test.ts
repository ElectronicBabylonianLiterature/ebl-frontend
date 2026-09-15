import { produce } from 'immer'
import { addAccents, addBreves } from './accents'
import { AkkadianWord, Enclosure, NamedSign, ValueToken } from './token'

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

function valuePart(value: string): ValueToken {
  return {
    value,
    cleanValue: value,
    enclosureType: [],
    erasure: 'NONE',
    type: 'ValueToken',
  }
}

const closingBreak = {
  value: ']',
  cleanValue: '',
  enclosureType: ['BROKEN_AWAY'],
  erasure: 'NONE',
  type: 'BrokenAway',
  side: 'RIGHT',
} as unknown as Enclosure

function reading(
  nameParts: readonly (ValueToken | Enclosure)[],
  nameBreaks?: readonly Enclosure[] | null,
): NamedSign {
  return {
    value: 'k]u',
    cleanValue: 'ku',
    enclosureType: [],
    erasure: 'NONE',
    type: 'Reading',
    name: 'ku',
    nameParts,
    nameBreaks,
    subIndex: 1,
    modifiers: [],
    flags: [],
  } as unknown as NamedSign
}

describe('addAccents', () => {
  it('puts a name break back between the parts it separates', () => {
    const [parts] = addAccents(
      reading([valuePart('k'), valuePart('u')], [closingBreak]),
    )

    expect(parts.map((part) => part.value)).toEqual(['k', ']', 'u'])
  })

  it('renders a legacy already-interleaved name unchanged', () => {
    const [parts] = addAccents(
      reading([valuePart('k'), closingBreak, valuePart('u')]),
    )

    expect(parts.map((part) => part.value)).toEqual(['k', ']', 'u'])
  })
})
