import {
  buildRealiaInfoLookup,
  getRealiaIndicatorClass,
  getRealiaLabel,
  getSpanIndicatorClass,
  getSpanLabel,
  RealiaInfoLookup,
  toRealiaDisplayInfo,
  toRealiaDisplayInfoEntry,
} from 'fragmentarium/ui/text-annotation/realiaInfo'
import { RealiaInfoEntry } from 'fragmentarium/ui/text-annotation/EntityType'
import {
  entityAnnotationSpan,
  realiaAnnotationSpan,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'
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

const realiaSpan = realiaAnnotationSpan(
  { id: 'Realia-1', realiaId: 'realia_000846', span: ['Word-1'] },
  { tier: 2 },
)
const entitySpan = entityAnnotationSpan({
  id: 'Entity-1',
  type: 'PERSONAL_NAME',
  span: ['Word-1'],
})

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

const mappedInfoEntry: RealiaInfoEntry = {
  realiaId: 'realia_000846',
  lemma: 'Apkallu',
  type: ['Divine names'],
}
const unmappedInfoEntry: RealiaInfoEntry = {
  realiaId: 'realia_000999',
  lemma: 'Ziggurat',
  type: ['Literature'],
}

describe('toRealiaDisplayInfoEntry', () => {
  it('derives the lemma and the mapped tag from an inline entry', () => {
    expect(toRealiaDisplayInfoEntry(mappedInfoEntry)).toEqual({
      lemma: 'Apkallu',
      entityType: 'DIVINE_NAME',
    })
  })

  it('leaves the tag null for an unmapped classification', () => {
    expect(toRealiaDisplayInfoEntry(unmappedInfoEntry).entityType).toBeNull()
  })
})

describe('buildRealiaInfoLookup', () => {
  it('keys the inline entries by realiaId', () => {
    const built = buildRealiaInfoLookup([mappedInfoEntry, unmappedInfoEntry])

    expect(built.get('realia_000846')).toEqual({
      lemma: 'Apkallu',
      entityType: 'DIVINE_NAME',
    })
    expect(built.get('realia_000999')?.lemma).toBe('Ziggurat')
  })

  it('returns an empty lookup for no entries', () => {
    expect(buildRealiaInfoLookup([]).size).toBe(0)
  })
})
