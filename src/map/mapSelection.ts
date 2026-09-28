export type MapSelection = {
  readonly type: 'excavation-area'
  readonly polygonId: string
}

export function serializeMapSelection(selection: MapSelection | null): string {
  return selection === null ? '' : `area:${selection.polygonId}`
}

export function parseMapSelection(value: string): MapSelection | null {
  const [kind, ...rest] = value.split(':')
  const polygonId = rest.join(':')
  return kind === 'area' && polygonId
    ? { type: 'excavation-area', polygonId }
    : null
}
