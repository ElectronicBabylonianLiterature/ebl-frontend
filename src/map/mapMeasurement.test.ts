import type { Position } from 'geojson'
import { MEASUREMENT_DISCLAIMER, measure } from './mapMeasurement'

const ASSUR: Position = [43.2597, 35.4573]
const NEARBY: Position = [43.2697, 35.4573]
const FAR: Position = [44.5, 35.4573]

const SMALL_SQUARE: readonly Position[] = [
  [43.25, 35.45],
  [43.2505, 35.45],
  [43.2505, 35.4505],
  [43.25, 35.4505],
]

const LARGE_SQUARE: readonly Position[] = [
  [43, 35],
  [44, 35],
  [44, 36],
  [43, 36],
]

describe('distance measurement', () => {
  it('reports short distances in metres', () => {
    expect(measure('distance', [ASSUR, NEARBY], 'metric').label).toMatch(
      /^9\d\d\.\d m$/,
    )
  })

  it('reports long distances in kilometres', () => {
    expect(measure('distance', [ASSUR, FAR], 'metric').label).toMatch(/ km$/)
  })

  it('reports short distances in feet', () => {
    expect(measure('distance', [ASSUR, NEARBY], 'imperial').label).toMatch(
      / ft$/,
    )
  })

  it('reports long distances in miles', () => {
    expect(measure('distance', [ASSUR, FAR], 'imperial').label).toMatch(/ mi$/)
  })

  it('sums a multi-segment path', () => {
    const twoLegs = measure('distance', [ASSUR, NEARBY, ASSUR], 'metric')
    const oneLeg = measure('distance', [ASSUR, NEARBY], 'metric')

    expect(twoLegs.valueInBaseUnits).toBeCloseTo(
      (oneLeg.valueInBaseUnits as number) * 2,
      6,
    )
  })
})

describe('area measurement', () => {
  it('reports small areas in square metres', () => {
    expect(measure('area', SMALL_SQUARE, 'metric').label).toMatch(/ m²$/)
  })

  it('reports large areas in square kilometres', () => {
    expect(measure('area', LARGE_SQUARE, 'metric').label).toMatch(/ km²$/)
  })

  it('reports small areas in square feet', () => {
    expect(measure('area', SMALL_SQUARE, 'imperial').label).toMatch(/ sq ft$/)
  })

  it('reports large areas in acres', () => {
    expect(measure('area', LARGE_SQUARE, 'imperial').label).toMatch(/ acres$/)
  })

  it('accepts an already-closed ring without double counting', () => {
    const open = measure('area', SMALL_SQUARE, 'metric')
    const closed = measure('area', [...SMALL_SQUARE, SMALL_SQUARE[0]], 'metric')

    expect(closed.valueInBaseUnits).toBeCloseTo(
      open.valueInBaseUnits as number,
      6,
    )
  })

  it('reuses the geodesic area primitive rather than a planar estimate', () => {
    const near = measure('area', LARGE_SQUARE, 'metric')
    const equatorial = measure(
      'area',
      LARGE_SQUARE.map(([longitude]) => [longitude, 0] as Position),
      'metric',
    )

    expect(near.valueInBaseUnits).not.toBe(equatorial.valueInBaseUnits)
  })
})

describe('incomplete measurements', () => {
  it('prompts for a first point', () => {
    expect(measure('distance', [], 'metric').label).toBe(
      'Select points on the map to measure a distance.',
    )
    expect(measure('area', [], 'metric').label).toBe(
      'Select points on the map to measure an area.',
    )
  })

  it.each([
    ['distance', [ASSUR], 'Add 1 more point.'],
    ['area', [ASSUR], 'Add 2 more points.'],
    ['area', [ASSUR, NEARBY], 'Add 1 more point.'],
  ])('asks for the remaining %s vertices', (mode, positions, expected) => {
    expect(
      measure(mode as 'distance' | 'area', positions as Position[], 'metric')
        .label,
    ).toBe(expected)
  })

  it('says so when enough points enclose nothing', () => {
    expect(
      measure(
        'area',
        [
          [43.25, 35.45],
          [43.26, 35.45],
          [43.27, 35.45],
        ],
        'metric',
      ),
    ).toMatchObject({
      valueInBaseUnits: null,
      label: 'These points do not enclose a measurable value.',
    })
  })

  it('reports a degenerate distance as unmeasurable', () => {
    expect(measure('distance', [ASSUR, ASSUR], 'metric').label).toBe(
      'These points do not enclose a measurable value.',
    )
  })
})

describe('the measurement disclaimer', () => {
  it('never presents a measurement as an archaeological record', () => {
    expect(MEASUREMENT_DISCLAIMER).toContain('Temporary map measurement')
    expect(MEASUREMENT_DISCLAIMER).toContain('Not an archaeological annotation')
  })
})
