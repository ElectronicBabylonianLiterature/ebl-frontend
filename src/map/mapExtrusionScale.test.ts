import { evaluateExpression } from 'test-support/mapExpressionEvaluator'
import { aggregateFindspotMapData } from './findspotMapData'
import { buildVisualizationValues } from './mapVisualizationValues'
import {
  MAPPED_ZERO_EXTRUSION_UNITS,
  MAX_EXTRUSION_UNITS,
  buildExtrusionScale,
  extrusionHeight,
  extrusionHeightExpression,
  extrusionLegendSamples,
  extrusionValueKey,
} from './mapExtrusionScale'
import { excavationPolygon, findspotMapData } from 'test-support/map-fixtures'

const POLYGON_IDS = [
  ...Array.from({ length: 20 }, (_entry, index) => `p${index}`),
  'outlier',
  'zero',
]

const index = new Map([
  [
    'assur',
    POLYGON_IDS.map((polygonId) =>
      excavationPolygon({ polygonId, areaSquareKm: 0.5 }),
    ),
  ],
])

function valuesFor(
  entries: readonly { polygonId: string; fragments: number }[],
): ReturnType<typeof buildVisualizationValues> {
  return buildVisualizationValues(
    aggregateFindspotMapData(
      entries.map((entry, position) =>
        findspotMapData({
          findspotId: 100 + position,
          polygonIds: [entry.polygonId],
          accessibleFragmentCount: entry.fragments,
        }),
      ),
    ),
    index,
  )
}

/** Twenty ordinary polygons plus one extreme outlier and one mapped zero. */
const values = valuesFor([
  ...Array.from({ length: 20 }, (_entry, position) => ({
    polygonId: `p${position}`,
    fragments: position + 1,
  })),
  { polygonId: 'outlier', fragments: 5000 },
  { polygonId: 'zero', fragments: 0 },
])

describe('metric selection', () => {
  it.each([
    ['accessible-fragments', 'accessibleFragmentCount'],
    ['mapped-findspots', 'findspotCount'],
    ['log-fragments', 'accessibleFragmentCount'],
    ['fragment-density', 'densityPerSquareKm'],
  ] as const)('reads %s from %s', (metric, key) => {
    expect(extrusionValueKey(metric)).toBe(key)
  })

  it('is null when no polygon has a positive value', () => {
    expect(
      buildExtrusionScale(
        'accessible-fragments',
        valuesFor([{ polygonId: 'zero', fragments: 0 }]),
      ),
    ).toBeNull()
  })

  it('is null for density when no geodesic area is usable', () => {
    const noArea = buildVisualizationValues(
      aggregateFindspotMapData([findspotMapData({ polygonIds: ['ghost'] })]),
      new Map(),
    )

    expect(buildExtrusionScale('fragment-density', noArea)).toBeNull()
  })
})

describe('height model', () => {
  const scale = buildExtrusionScale('accessible-fragments', values)!
  const linear = buildExtrusionScale('mapped-findspots', values)!

  it('is deterministic for the same values', () => {
    expect(buildExtrusionScale('accessible-fragments', values)).toEqual(scale)
    expect(extrusionHeight(scale, 8)).toBe(extrusionHeight(scale, 8))
  })

  it('caps every height at the fixed ceiling', () => {
    expect(extrusionHeight(scale, 5000)).toBe(MAX_EXTRUSION_UNITS)
    expect(extrusionHeight(scale, 10 ** 9)).toBe(MAX_EXTRUSION_UNITS)
    expect(extrusionHeight(linear, 10 ** 9)).toBe(MAX_EXTRUSION_UNITS)
  })

  it('clips the reference below a single extreme outlier', () => {
    expect(scale.referenceValue).toBeLessThan(5000)
    expect(scale.referenceValue).toBeLessThanOrEqual(30)
  })

  it('keeps the ordinary range readable despite the outlier', () => {
    const low = extrusionHeight(scale, 1)
    const mid = extrusionHeight(scale, 8)
    const high = extrusionHeight(scale, 20)

    expect(low).toBeGreaterThan(0)
    expect(mid).toBeGreaterThan(low)
    expect(high).toBeGreaterThan(mid)
    expect(mid / MAX_EXTRUSION_UNITS).toBeGreaterThan(0.5)
  })

  it('gives zero and unusable values no height', () => {
    expect(extrusionHeight(scale, 0)).toBe(0)
    expect(extrusionHeight(scale, -5)).toBe(0)
    expect(extrusionHeight(scale, Number.NaN)).toBe(0)
  })

  it('honours the user height scale', () => {
    const doubled = buildExtrusionScale('accessible-fragments', values, 2)!
    expect(doubled.maxHeightUnits).toBe(MAX_EXTRUSION_UNITS * 2)
  })

  it('uses a linear method only for findspot counts', () => {
    expect(linear.method).toBe('linear')
    expect(scale.method).toBe('logarithmic')
  })
})

describe('height expression', () => {
  const scale = buildExtrusionScale('accessible-fragments', values)!
  const heightFor = (featureState: Record<string, unknown>): unknown =>
    evaluateExpression(extrusionHeightExpression(scale), { featureState })

  it('leaves an unmapped polygon completely flat', () => {
    expect(heightFor({ findspotCount: 0, accessibleFragmentCount: 0 })).toBe(0)
    expect(heightFor({})).toBe(0)
  })

  it('gives a mapped polygon with zero fragments a minimal plinth', () => {
    expect(heightFor({ findspotCount: 3, accessibleFragmentCount: 0 })).toBe(
      MAPPED_ZERO_EXTRUSION_UNITS,
    )
  })

  it('matches the pure height model', () => {
    expect(
      heightFor({ findspotCount: 1, accessibleFragmentCount: 8 }),
    ).toBeCloseTo(extrusionHeight(scale, 8), 5)
  })

  it('flattens everything without a scale', () => {
    expect(evaluateExpression(extrusionHeightExpression(null), {})).toBe(0)
  })
})

describe('legend samples', () => {
  it('describes low, mid and capped heights', () => {
    const samples = extrusionLegendSamples(
      buildExtrusionScale('accessible-fragments', values)!,
    )

    expect(samples).toHaveLength(3)
    expect(samples[0].value).toBeLessThan(samples[2].value)
    expect(samples[2].label).toContain('and above')
  })
})
