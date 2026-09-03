import { aggregateFindspotMapData } from 'map/findspotMapDataSanitizer'
import {
  buildVisualizationValues,
  featureStateFor,
  isDensityAvailable,
  visualizationValuesFor,
} from './mapVisualizationValues'
import { EVIDENCE_CODES } from './mapEvidencePaint'
import {
  excavationPolygon,
  findspotMapDataDto as findspotMapData,
} from 'test-support/map-fixtures'

function summariesFor(
  entries: readonly { polygonId: string; fragments: number }[],
): ReturnType<typeof aggregateFindspotMapData> {
  return aggregateFindspotMapData(
    entries.map((entry, index) =>
      findspotMapData({
        findspotId: 100 + index,
        polygonIds: [entry.polygonId],
        accessibleFragmentCount: entry.fragments,
      }),
    ),
  )
}

const index = new Map([
  [
    'assur',
    [
      excavationPolygon({ polygonId: 'a', areaSquareKm: 2 }),
      excavationPolygon({ polygonId: 'b', areaSquareKm: 0.5 }),
      excavationPolygon({ polygonId: 'no-area', areaSquareKm: null }),
      excavationPolygon({ polygonId: 'zero-area', areaSquareKm: 0 }),
    ],
  ],
])

describe('buildVisualizationValues', () => {
  it('divides authorized counts by geodesic area', () => {
    const values = buildVisualizationValues(
      summariesFor([
        { polygonId: 'a', fragments: 10 },
        { polygonId: 'b', fragments: 10 },
      ]),
      index,
    )

    expect(values.get('a')?.densityPerSquareKm).toBe(5)
    expect(values.get('b')?.densityPerSquareKm).toBe(20)
  })

  it('leaves density null when the geometry has no usable area', () => {
    const values = buildVisualizationValues(
      summariesFor([
        { polygonId: 'no-area', fragments: 4 },
        { polygonId: 'zero-area', fragments: 4 },
      ]),
      index,
    )

    expect(values.get('no-area')?.densityPerSquareKm).toBeNull()
    expect(values.get('zero-area')?.densityPerSquareKm).toBeNull()
  })

  it('leaves density null for a polygon absent from the index', () => {
    const values = buildVisualizationValues(
      summariesFor([{ polygonId: 'unknown', fragments: 4 }]),
      index,
    )

    expect(values.get('unknown')?.areaSquareKm).toBeNull()
    expect(values.get('unknown')?.densityPerSquareKm).toBeNull()
  })

  it('carries the authorized counts through unchanged', () => {
    const values = buildVisualizationValues(
      summariesFor([{ polygonId: 'a', fragments: 7 }]),
      index,
    )

    expect(values.get('a')).toMatchObject({
      polygonId: 'a',
      findspotCount: 1,
      accessibleFragmentCount: 7,
      areaSquareKm: 2,
    })
  })

  it('is empty without map data', () => {
    expect(buildVisualizationValues(new Map(), index).size).toBe(0)
  })
})

describe('visualizationValuesFor', () => {
  const values = buildVisualizationValues(
    summariesFor([
      { polygonId: 'a', fragments: 10 },
      { polygonId: 'no-area', fragments: 3 },
    ]),
    index,
  )

  it('lists accessible counts for count and log modes', () => {
    expect([...visualizationValuesFor(values, 'count')].sort()).toEqual([10, 3])
    expect([...visualizationValuesFor(values, 'log')].sort()).toEqual([10, 3])
  })

  it('omits polygons without a density from density mode', () => {
    expect(visualizationValuesFor(values, 'density')).toEqual([5])
  })
})

describe('isDensityAvailable', () => {
  it('is true when at least one polygon has a positive density', () => {
    expect(
      isDensityAvailable(
        buildVisualizationValues(
          summariesFor([{ polygonId: 'a', fragments: 4 }]),
          index,
        ),
      ),
    ).toBe(true)
  })

  it('is false when every density is null', () => {
    expect(
      isDensityAvailable(
        buildVisualizationValues(
          summariesFor([{ polygonId: 'no-area', fragments: 4 }]),
          index,
        ),
      ),
    ).toBe(false)
  })

  it('is false when every mapped polygon has zero accessible fragments', () => {
    expect(
      isDensityAvailable(
        buildVisualizationValues(
          summariesFor([{ polygonId: 'a', fragments: 0 }]),
          index,
        ),
      ),
    ).toBe(false)
  })
})

describe('featureStateFor', () => {
  it('includes density only when it exists', () => {
    const values = buildVisualizationValues(
      summariesFor([
        { polygonId: 'a', fragments: 10 },
        { polygonId: 'no-area', fragments: 3 },
      ]),
      index,
    )

    expect(featureStateFor(values.get('a')!)).toEqual({
      findspotCount: 1,
      accessibleFragmentCount: 10,
      evidenceCode: EVIDENCE_CODES['verified-source'],
      densityPerSquareKm: 5,
    })
    expect(featureStateFor(values.get('no-area')!)).toEqual({
      findspotCount: 1,
      accessibleFragmentCount: 3,
      evidenceCode: EVIDENCE_CODES['verified-source'],
    })
  })
})
