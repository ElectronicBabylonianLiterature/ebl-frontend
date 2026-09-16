import { produce } from 'immer'
import { addAccents, addBreves } from 'transliteration/domain/accents'
import {
  AkkadianWord,
  Enclosure,
  NamedSign,
  ValueToken,
} from 'transliteration/domain/token'
import {
  brokenAway,
  namedSignFixture,
  valueToken,
} from 'test-support/named-sign-fixtures'

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

function reading(
  nameParts: readonly (ValueToken | Enclosure)[],
  nameBreaks?: readonly Enclosure[] | null,
): NamedSign {
  return namedSignFixture({ nameParts, nameBreaks })
}

const closingBreak: Enclosure = brokenAway(']', 'RIGHT')

describe('addAccents', () => {
  it('puts a name break back between the parts it separates', () => {
    const [parts] = addAccents(
      reading([valueToken('k'), valueToken('u')], [closingBreak]),
    )

    expect(parts.map((part) => part.value)).toEqual(['k', ']', 'u'])
  })

  it('renders a legacy already-interleaved name unchanged', () => {
    const [parts] = addAccents(
      reading([valueToken('k'), closingBreak, valueToken('u')]),
    )

    expect(parts.map((part) => part.value)).toEqual(['k', ']', 'u'])
  })
})
