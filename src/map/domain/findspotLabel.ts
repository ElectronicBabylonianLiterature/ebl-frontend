import type { FindspotMapData } from 'fragmentarium/domain/findspotMapData'

type FindspotLocation = Pick<
  FindspotMapData,
  'sector' | 'area' | 'building' | 'room'
>

const BARE_IDENTIFIER = /^[0-9]+[a-z]?$/i

function qualified(
  kind: string,
  value: string | null | undefined,
): string | null | undefined {
  const trimmed = value?.trim()
  return trimmed && BARE_IDENTIFIER.test(trimmed) ? `${kind} ${trimmed}` : value
}

export function findspotLabel(findspot: FindspotLocation): string {
  const fields = [
    findspot.sector,
    findspot.area,
    qualified('Building', findspot.building),
    qualified('Room', findspot.room),
  ]
  const labels = fields.flatMap((value) =>
    value?.trim() ? [value.trim()] : [],
  )
  return labels.length > 0 ? labels.join(' · ') : 'Location details unavailable'
}
