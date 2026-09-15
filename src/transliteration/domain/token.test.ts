import {
  effectiveEnclosure,
  EnclosureType,
  isStrictlyPartiallyEnclosed,
  NamedSign,
  nameTokens,
} from 'transliteration/domain/token'

function namedSign(partEnclosures: EnclosureType[][]): NamedSign {
  return {
    nameParts: partEnclosures.map((enclosureType) => ({ enclosureType })),
  } as unknown as NamedSign
}

describe('effectiveEnclosure', () => {
  it('keeps only the enclosures shared by every name part', () => {
    expect(
      effectiveEnclosure(namedSign([['BROKEN_AWAY'], ['BROKEN_AWAY']])),
    ).toEqual(['BROKEN_AWAY'])
  })

  it('is empty when the parts share none', () => {
    expect(effectiveEnclosure(namedSign([['BROKEN_AWAY'], []]))).toEqual([])
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
})

function name(nameParts: string[], nameBreaks?: string[] | null): NamedSign {
  return {
    nameParts: nameParts.map((value) => ({ value })),
    ...(nameBreaks === undefined
      ? {}
      : { nameBreaks: nameBreaks?.map((value) => ({ value })) ?? nameBreaks }),
  } as unknown as NamedSign
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

  it('passes a legacy already-interleaved payload through untouched', () => {
    expect(values(name(['k', ']', 'u']))).toEqual(['k', ']', 'u'])
  })

  it('treats an explicit null as the legacy shape', () => {
    expect(values(name(['k', ']', 'u'], null))).toEqual(['k', ']', 'u'])
  })
})
