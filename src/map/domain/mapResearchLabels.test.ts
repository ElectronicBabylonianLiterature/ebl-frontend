import { mappedAreaLabel } from 'map/domain/mapResearchLabels'

it.each([
  [0.0004, '400 m²'],
  [0.0000001, '1 m²'],
  [0.5, '500,000 m²'],
  [1, '1 km²'],
  [12.3456, '12.35 km²'],
])('labels a mapped area of %s km² as %s', (areaSquareKm, label) => {
  expect(mappedAreaLabel(areaSquareKm)).toBe(label)
})
