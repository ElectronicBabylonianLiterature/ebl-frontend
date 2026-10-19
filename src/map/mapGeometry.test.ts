import type { Feature, Geometry } from 'geojson'
import {
  boundingBoxOfFeatures,
  boundingBoxOfGeometry,
  boundingBoxOfPositions,
  collectPositions,
  firstPosition,
  unionBoundingBoxes,
} from 'map/mapGeometry'

function feature(geometry: Geometry): Feature {
  return { type: 'Feature', properties: {}, geometry }
}

it('collects nested longitude/latitude pairs and ignores incomplete coordinates', () => {
  expect(
    collectPositions([
      [
        [43, 35, 100],
        [44, 36],
      ],
      null,
      [42],
      [41, 'north'],
      ['east', 34],
    ]),
  ).toEqual([
    [43, 35],
    [44, 36],
  ])
})

it('finds coordinate extremes independently of input order', () => {
  expect(
    boundingBoxOfPositions([
      [43, 35],
      [44, 33],
      [40, 38],
    ]),
  ).toEqual([40, 33, 44, 38])
  expect(boundingBoxOfPositions([])).toBeNull()
})

it('combines feature bounds through nested geometry collections', () => {
  expect(
    boundingBoxOfFeatures([
      feature({ type: 'Polygon', coordinates: [] }),
      feature({
        type: 'GeometryCollection',
        geometries: [
          { type: 'Point', coordinates: [43, 35] },
          {
            type: 'GeometryCollection',
            geometries: [
              {
                type: 'LineString',
                coordinates: [
                  [40, 38],
                  [44, 33],
                ],
              },
            ],
          },
        ],
      }),
      feature({ type: 'Point', coordinates: [45, 39] }),
    ]),
  ).toEqual([40, 33, 45, 39])
})

it('returns no feature or geometry bounds when there are no coordinates', () => {
  expect(boundingBoxOfFeatures([])).toBeNull()
  expect(
    boundingBoxOfGeometry({ type: 'GeometryCollection', geometries: [] }),
  ).toBeNull()
})

it('unions available boxes while preserving a single box and ignoring nulls', () => {
  expect(
    unionBoundingBoxes([null, [43, 35, 44, 36], [40, 33, 45, 39], null]),
  ).toEqual([40, 33, 45, 39])
  expect(unionBoundingBoxes([null, [43, 35, 44, 36]])).toEqual([43, 35, 44, 36])
  expect(unionBoundingBoxes([null, null])).toBeNull()
  expect(unionBoundingBoxes([])).toBeNull()
})

it('finds the first coordinate in a geometry', () => {
  expect(
    firstPosition({
      type: 'MultiLineString',
      coordinates: [
        [],
        [
          [43, 35, 100],
          [44, 36],
        ],
      ],
    }),
  ).toEqual([43, 35])
})

it('finds the first coordinate after empty collection members', () => {
  expect(
    firstPosition({
      type: 'GeometryCollection',
      geometries: [
        { type: 'GeometryCollection', geometries: [] },
        { type: 'Polygon', coordinates: [] },
        { type: 'Point', coordinates: [43, 35] },
        { type: 'Point', coordinates: [44, 36] },
      ],
    }),
  ).toEqual([43, 35])
})

it('returns no first position for empty geometry', () => {
  expect(firstPosition({ type: 'Polygon', coordinates: [] })).toBeNull()
  expect(
    firstPosition({ type: 'GeometryCollection', geometries: [] }),
  ).toBeNull()
})
