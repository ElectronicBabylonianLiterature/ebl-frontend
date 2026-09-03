import { parse, stringify } from 'query-string'

export const MAP_URL_STATE_VERSION = 1

const VERSION_PARAM = 'mv'
const FILTER_PARAM = 'findspot'
const AREAS_PARAM = 'areas'

export interface MapUrlState {
  readonly version: number
  readonly filter: string
  readonly showExcavationAreas: boolean
}

export const DEFAULT_MAP_URL_STATE: MapUrlState = {
  version: MAP_URL_STATE_VERSION,
  filter: '',
  showExcavationAreas: false,
}

function asString(value: string | (string | null)[] | null): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export function parseMapUrlState(search: string): MapUrlState {
  const query = parse(search)
  const version = Number.parseInt(asString(query[VERSION_PARAM]), 10)

  if (Number.isNaN(version) || version !== MAP_URL_STATE_VERSION) {
    return DEFAULT_MAP_URL_STATE
  }

  return {
    version: MAP_URL_STATE_VERSION,
    filter: asString(query[FILTER_PARAM]),
    showExcavationAreas: asString(query[AREAS_PARAM]) === '1',
  }
}

export function serializeMapUrlState(state: MapUrlState): string {
  return stringify(
    {
      [VERSION_PARAM]: MAP_URL_STATE_VERSION,
      [FILTER_PARAM]: state.filter || undefined,
      [AREAS_PARAM]: state.showExcavationAreas ? '1' : undefined,
    },
    { skipEmptyString: true },
  )
}
