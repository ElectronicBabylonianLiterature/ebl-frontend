import {
  effectiveEnclosure,
  EnclosureType,
  isStrictlyPartiallyEnclosed,
  NamedSign,
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
