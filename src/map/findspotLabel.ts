import type { FindspotMapData } from 'map/findspotMapData'

type FindspotLocation = Pick<
  FindspotMapData,
  'sector' | 'area' | 'building' | 'room'
>

export function findspotLabel(findspot: FindspotLocation): string {
  const fields = [
    findspot.sector,
    findspot.area,
    findspot.building,
    findspot.room,
  ]
  const labels = fields.flatMap((value) =>
    value?.trim() ? [value.trim()] : [],
  )
  return labels.length > 0 ? labels.join(' · ') : 'Location details unavailable'
}
