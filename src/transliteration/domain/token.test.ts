import {
  effectiveEnclosure,
  EnclosureType,
  isStrictlyPartiallyEnclosed,
  NamedSign,
  nameTokens,
} from 'transliteration/domain/token'
import {
  brokenAway,
  namedSignFixture,
  valueToken,
} from 'test-support/named-sign-fixtures'

function namedSign(partEnclosures: EnclosureType[][]): NamedSign {
  return namedSignFixture({
    nameParts: partEnclosures.map((enclosureType) =>
      valueToken('x', enclosureType),
    ),
  })
}

const interruptedName: NamedSign = namedSignFixture({
  nameParts: [
    valueToken('k', ['BROKEN_AWAY']),
    valueToken('u', ['BROKEN_AWAY']),
  ],
  nameBreaks: [brokenAway(']', 'RIGHT')],
})

describe('effectiveEnclosure', () => {
  it('keeps only the enclosures shared by every name part', () => {
    expect(
      effectiveEnclosure(namedSign([['BROKEN_AWAY'], ['BROKEN_AWAY']])),
    ).toEqual(['BROKEN_AWAY'])
  })

  it('is empty when the parts share none', () => {
    expect(effectiveEnclosure(namedSign([['BROKEN_AWAY'], []]))).toEqual([])
  })

  it('counts the name breaks, not only the name parts', () => {
    expect(effectiveEnclosure(interruptedName)).toEqual([])
  })
})

describe('isStrictlyPartiallyEnclosed', () => {
  it('is true when only some name parts carry the enclosure', () => {
    expect(
      isStrictlyPartiallyEnclosed(
        namedSign([['BROKEN_AWAY'], []]),
        'BROKEN_AWAY',
      ),
    ).toBe(true)
  })

  it('is false when every name part carries it', () => {
    expect(
      isStrictlyPartiallyEnclosed(
        namedSign([['BROKEN_AWAY'], ['BROKEN_AWAY']]),
        'BROKEN_AWAY',
      ),
    ).toBe(false)
  })

  it('is false when no name part carries it', () => {
    expect(
      isStrictlyPartiallyEnclosed(namedSign([[], []]), 'BROKEN_AWAY'),
    ).toBe(false)
  })

  it('is true when a name break interrupts an otherwise enclosed name', () => {
    expect(isStrictlyPartiallyEnclosed(interruptedName, 'BROKEN_AWAY')).toBe(
      true,
    )
  })
})

function name(nameParts: string[], nameBreaks?: string[] | null): NamedSign {
  const parts = nameParts.map((value) => valueToken(value))
  if (nameBreaks === undefined) {
    return namedSignFixture({ nameParts: parts })
  }
  return namedSignFixture({
    nameParts: parts,
    nameBreaks:
      nameBreaks === null
        ? null
        : nameBreaks.map((value) => brokenAway(value, 'RIGHT')),
  })
}

function values(namedSign: NamedSign): string[] {
  return nameTokens(namedSign).map((token) => token.value)
}

describe('nameTokens', () => {
  it('interleaves the breaks back between the parts', () => {
    expect(values(name(['k', 'u'], [']']))).toEqual(['k', ']', 'u'])
  })

  it('returns the parts unchanged when there are no breaks', () => {
    expect(values(name(['k', 'u'], []))).toEqual(['k', 'u'])
  })

  it('keeps a trailing break after its part', () => {
    expect(values(name(['ku'], [']']))).toEqual(['ku', ']'])
  })

  it('keeps breaks that outnumber the parts', () => {
    expect(values(name(['ku'], [']', '[']))).toEqual(['ku', ']', '['])
  })

  it('passes a legacy already-interleaved payload through untouched', () => {
    expect(values(name(['k', ']', 'u']))).toEqual(['k', ']', 'u'])
  })

  it('treats an explicit null as the legacy shape', () => {
    expect(values(name(['k', ']', 'u'], null))).toEqual(['k', ']', 'u'])
  })
})
