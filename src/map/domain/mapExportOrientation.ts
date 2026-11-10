import type { Geometry, Position } from 'geojson'

function orientedRing(
  ring: readonly Position[],
  isExterior: boolean,
): Position[] {
  const signedArea = ring.reduce((sum, position, index) => {
    const next = ring[(index + 1) % ring.length]
    return sum + position[0] * next[1] - next[0] * position[1]
  }, 0)
  const copy = ring.map((position) => [...position])
  return (signedArea < 0 && isExterior) || (signedArea > 0 && !isExterior)
    ? copy.reverse()
    : copy
}

function orientedPolygon(rings: readonly Position[][]): Position[][] {
  return rings.map((ring, index) => orientedRing(ring, index === 0))
}

export default function orientExportGeometry(geometry: Geometry): Geometry {
  if (geometry.type === 'Polygon') {
    return { ...geometry, coordinates: orientedPolygon(geometry.coordinates) }
  }
  if (geometry.type === 'MultiPolygon') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map(orientedPolygon),
    }
  }
  return geometry
}
