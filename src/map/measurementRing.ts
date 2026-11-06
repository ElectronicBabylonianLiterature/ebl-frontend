import type { Position } from 'geojson'
import { segmentsIntersect } from 'map/segmentIntersection'

function intersectsOtherSegment(
  ring: readonly Position[],
  index: number,
): boolean {
  const segmentCount = ring.length - 1
  for (let other = index + 1; other < segmentCount; other += 1) {
    if (other === index + 1 || (index === 0 && other === segmentCount - 1))
      continue
    if (
      segmentsIntersect(
        ring[index],
        ring[index + 1],
        ring[other],
        ring[other + 1],
      )
    )
      return true
  }
  return false
}

export function isSimpleMeasurementRing(ring: readonly Position[]): boolean {
  const segmentCount = ring.length - 1
  if (segmentCount < 3) return false
  const first = ring[0]
  const last = ring[segmentCount]
  if (first[0] !== last[0] || first[1] !== last[1]) return false
  for (let index = 0; index < segmentCount; index += 1) {
    const start = ring[index]
    const end = ring[index + 1]
    if (start[0] === end[0] && start[1] === end[1]) return false
    if (intersectsOtherSegment(ring, index)) return false
  }
  return true
}
