import {
  Enclosure,
  EnclosureType,
  NamedSign,
  ValueToken,
} from 'transliteration/domain/token'

export function valueToken(
  value: string,
  enclosureType: readonly EnclosureType[] = [],
): ValueToken {
  return {
    type: 'ValueToken',
    value,
    cleanValue: value,
    enclosureType,
    erasure: 'NONE',
  }
}

export function brokenAway(
  value: string,
  side: Enclosure['side'],
  enclosureType: readonly EnclosureType[] = [],
): Enclosure {
  return {
    type: 'BrokenAway',
    value,
    cleanValue: '',
    enclosureType,
    erasure: 'NONE',
    side,
  }
}

export function namedSignFixture({
  nameParts,
  nameBreaks,
  subIndex = 1,
}: {
  readonly nameParts: readonly (ValueToken | Enclosure)[]
  readonly nameBreaks?: readonly Enclosure[] | null
  readonly subIndex?: number | null
}): NamedSign {
  const name = nameParts.map((part) => part.cleanValue).join('')
  return {
    type: 'Reading',
    value: nameParts.map((part) => part.value).join(''),
    cleanValue: name,
    enclosureType: [],
    erasure: 'NONE',
    name,
    nameParts,
    ...(nameBreaks === undefined ? {} : { nameBreaks }),
    subIndex,
    modifiers: [],
    flags: [],
    sign: null,
  }
}
