import {
  geodesicDistanceMetres,
  geodesicPathLengthMetres,
} from 'map/domain/geodesicDistance'
import { finitePosition } from 'map/domain/mapToolInput'

it.each([-100, -91, 91, 100])(
  'rejects latitude %s in segment, path and map-tool input',
  (latitude) => {
    expect(geodesicDistanceMetres([0, latitude], [0, 0])).toBeNull()
    expect(geodesicDistanceMetres([0, 0], [0, latitude])).toBeNull()
    expect(
      geodesicPathLengthMetres([
        [0, 0],
        [0, latitude],
      ]),
    ).toBeNull()
    expect(finitePosition(0, latitude)).toBeNull()
  },
)

it('preserves valid world-wrapped longitude and stays finite for finite longitude', () => {
  expect(geodesicDistanceMetres([720, 0], [810, 0])).toBeCloseTo(
    geodesicDistanceMetres([0, 0], [90, 0]) as number,
    6,
  )
  expect(Number.isFinite(geodesicDistanceMetres([1e308, 0], [-1e308, 1]))).toBe(
    true,
  )
  expect(finitePosition(720, 90)).toEqual([720, 90])
})
