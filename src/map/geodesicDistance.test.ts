import { EARTH_RADIUS_METRES } from './geodesicArea'
import {
  geodesicDistanceMetres,
  geodesicPathLengthMetres,
} from './geodesicDistance'

const QUARTER_MERIDIAN = (Math.PI / 2) * EARTH_RADIUS_METRES

describe('geodesicDistanceMetres', () => {
  it('matches the analytic quarter meridian', () => {
    expect(geodesicDistanceMetres([0, 0], [0, 90])).toBeCloseTo(
      QUARTER_MERIDIAN,
      3,
    )
  })

  it('matches a quarter of the equator', () => {
    expect(geodesicDistanceMetres([0, 0], [90, 0])).toBeCloseTo(
      QUARTER_MERIDIAN,
      3,
    )
  })

  it('is zero for coincident points', () => {
    expect(geodesicDistanceMetres([43.26, 35.45], [43.26, 35.45])).toBe(0)
  })

  it('is symmetric', () => {
    const forward = geodesicDistanceMetres([43.25, 35.45], [43.26, 35.46])
    const backward = geodesicDistanceMetres([43.26, 35.46], [43.25, 35.45])

    expect(forward).toBeCloseTo(backward as number, 9)
  })

  it('handles antipodal points without exceeding the domain of asin', () => {
    expect(geodesicDistanceMetres([0, 0], [180, 0])).toBeCloseTo(
      Math.PI * EARTH_RADIUS_METRES,
      3,
    )
  })

  it.each([
    [[43.25], [43.26, 35.46]],
    [[43.25, 35.45], [43.26]],
    [
      [Number.NaN, 35.45],
      [43.26, 35.46],
    ],
    [
      [43.25, 35.45],
      [43.26, Number.POSITIVE_INFINITY],
    ],
  ])('refuses a malformed position %#', (from, to) => {
    expect(geodesicDistanceMetres(from, to)).toBeNull()
  })
})

describe('geodesicPathLengthMetres', () => {
  it('sums consecutive segments', () => {
    const total = geodesicPathLengthMetres([
      [0, 0],
      [0, 45],
      [0, 90],
    ])

    expect(total).toBeCloseTo(QUARTER_MERIDIAN, 3)
  })

  it.each([[[]], [[[0, 0]]]])('needs at least two points (%#)', (positions) => {
    expect(geodesicPathLengthMetres(positions)).toBeNull()
  })

  it('is null when the path has no length', () => {
    expect(
      geodesicPathLengthMetres([
        [43.25, 35.45],
        [43.25, 35.45],
      ]),
    ).toBeNull()
  })

  it('is null when any position is malformed', () => {
    expect(
      geodesicPathLengthMetres([
        [0, 0],
        [Number.NaN, 1],
      ]),
    ).toBeNull()
  })
})
