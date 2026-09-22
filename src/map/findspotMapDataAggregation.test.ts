import { aggregateFindspotMapData } from 'map/findspotMapDataSanitizer'
import type { FindspotMapData } from 'map/findspotMapData'

function findspot(overrides: Partial<FindspotMapData> = {}): FindspotMapData {
  return {
    findspotId: 1,
    siteId: 'ASSUR',
    siteName: 'Aššur',
    polygonIds: ['assur-area-a-checksum'],
    accessibleFragmentCount: 2,
    locationPrecision: 'excavation-area',
    matchMethod: 'verified-source',
    sector: null,
    area: 'Area A',
    building: null,
    room: null,
    ...overrides,
  }
}

describe('aggregateFindspotMapData', () => {
  it('returns empty map for empty input', () => {
    expect(aggregateFindspotMapData([]).size).toBe(0)
  })

  it('aggregates several findspots for one polygon', () => {
    const summaries = aggregateFindspotMapData([
      findspot({
        findspotId: 10,
        polygonIds: ['assur-area-a-checksum'],
        accessibleFragmentCount: 4,
      }),
      findspot({
        findspotId: 11,
        polygonIds: ['assur-area-a-checksum'],
        accessibleFragmentCount: 0,
      }),
    ])

    expect(summaries.get('assur-area-a-checksum')).toMatchObject({
      polygonId: 'assur-area-a-checksum',
      findspotIds: [10, 11],
      findspotCount: 2,
      accessibleFragmentCount: 4,
    })
  })

  it('contributes one findspot to each listed polygon deterministically', () => {
    const summaries = aggregateFindspotMapData([
      findspot({
        findspotId: 12,
        polygonIds: ['assur-area-b-checksum', 'assur-area-a-checksum'],
        accessibleFragmentCount: 5,
      }),
    ])

    expect([...summaries.keys()]).toEqual([
      'assur-area-a-checksum',
      'assur-area-b-checksum',
    ])
    expect(summaries.get('assur-area-a-checksum')?.findspotIds).toEqual([12])
    expect(summaries.get('assur-area-b-checksum')?.findspotIds).toEqual([12])
  })

  it('deterministically sorts polygon keys and findspot IDs', () => {
    const summaries = aggregateFindspotMapData([
      findspot({
        findspotId: 20,
        polygonIds: ['c-checksum', 'a-checksum', 'b-checksum'],
        accessibleFragmentCount: 1,
      }),
    ])

    expect([...summaries.keys()]).toEqual([
      'a-checksum',
      'b-checksum',
      'c-checksum',
    ])
    expect(summaries.get('a-checksum')?.findspotIds).toEqual([20])
    expect(summaries.get('b-checksum')?.findspotIds).toEqual([20])
    expect(summaries.get('c-checksum')?.findspotIds).toEqual([20])
  })

  it('does not mutate input records', () => {
    const input = [findspot({ findspotId: 30, accessibleFragmentCount: 7 })]
    const frozen = Object.freeze(input[0])
    expect(() => aggregateFindspotMapData([frozen])).not.toThrow()
  })
})
