import { segmentsIntersect } from 'map/domain/segmentIntersection'

it.each([NaN, Infinity, -Infinity])(
  'rejects a segment with non-finite coordinates %p',
  (longitude) => {
    expect(segmentsIntersect([longitude, 0], [1, 1], [0, 1], [1, 0])).toBe(
      false,
    )
  },
)
