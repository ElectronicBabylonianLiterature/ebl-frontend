import {
  getRealiaIds,
  getRealiaIndicatorClass,
  getRealiaLabel,
  getSpanIndicatorClass,
  getSpanLabel,
  RealiaInfoLookup,
  toRealiaDisplayInfo,
} from 'fragmentarium/ui/text-annotation/realiaInfo'
import {
  EntityAnnotationSpan,
  RealiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/annotationSpan'
import { realiaEntryFactory } from 'test-support/realia-fixtures'

const mappedEntry = realiaEntryFactory.build({
  id: 'Apkallu',
  realiaId: 'realia_000846',
  type: ['Divine names'],
})
const unmappedEntry = realiaEntryFactory.build({
  id: 'Ziggurat',
  realiaId: 'realia_000999',
  type: ['Literature'],
})

const lookup: RealiaInfoLookup = new Map([
  ['realia_000846', toRealiaDisplayInfo(mappedEntry)],
  ['realia_000999', toRealiaDisplayInfo(unmappedEntry)],
])

const realiaSpan: RealiaAnnotationSpan = {
  id: 'Realia-1',
  realiaId: 'realia_000846',
  span: ['Word-1'],
  tier: 2,
  name: 'realia_000846',
}
const entitySpan: EntityAnnotationSpan = {
  id: 'Entity-1',
  type: 'PERSONAL_NAME',
  span: ['Word-1'],
  tier: 1,
  name: 'Personal Name',
}

describe('toRealiaDisplayInfo', () => {
  it('derives the lemma and the mapped tag', () => {
    expect(toRealiaDisplayInfo(mappedEntry)).toEqual({
      lemma: 'Apkallu',
      entityType: 'DIVINE_NAME',
    })
  })

  it('leaves the tag null for an unmapped classification', () => {
    expect(toRealiaDisplayInfo(unmappedEntry).entityType).toBeNull()
  })
})

describe('getRealiaLabel', () => {
  it('resolves the lemma', () => {
    expect(getRealiaLabel(lookup, 'realia_000846')).toBe('Apkallu')
  })

  it('falls back to the realiaId when the lemma is unknown', () => {
    expect(getRealiaLabel(lookup, 'realia_404')).toBe('realia_404')
  })
})

describe('getRealiaIndicatorClass', () => {
  it('uses the mapped tag colour', () => {
    expect(getRealiaIndicatorClass(lookup, 'realia_000846')).toBe(
      'named-entity__DIVINE_NAME',
    )
  })

  it('falls back to the realia colour when unmapped', () => {
    expect(getRealiaIndicatorClass(lookup, 'realia_000999')).toBe(
      'named-entity__REALIA',
    )
  })

  it('falls back to the realia colour when unknown', () => {
    expect(getRealiaIndicatorClass(lookup, 'realia_404')).toBe(
      'named-entity__REALIA',
    )
  })
})

describe('getSpanLabel', () => {
  it('uses the lemma for realia spans', () => {
    expect(getSpanLabel(lookup, realiaSpan)).toBe('Apkallu')
  })

  it('uses the derived name for entity spans', () => {
    expect(getSpanLabel(lookup, entitySpan)).toBe('Personal Name')
  })
})

describe('getSpanIndicatorClass', () => {
  it('uses the entity type for entity spans', () => {
    expect(getSpanIndicatorClass(lookup, entitySpan)).toBe(
      'named-entity__PERSONAL_NAME',
    )
  })

  it('uses the mapped colour for realia spans', () => {
    expect(getSpanIndicatorClass(lookup, realiaSpan)).toBe(
      'named-entity__DIVINE_NAME',
    )
  })
})

describe('getRealiaIds', () => {
  it('collects the distinct realiaIds of the realia layer', () => {
    expect(
      getRealiaIds([
        entitySpan,
        realiaSpan,
        { ...realiaSpan, id: 'Realia-2' },
        { ...realiaSpan, id: 'Realia-3', realiaId: 'realia_000999' },
      ]),
    ).toEqual(['realia_000846', 'realia_000999'])
  })

  it('returns nothing without realia spans', () => {
    expect(getRealiaIds([entitySpan])).toEqual([])
  })
})
