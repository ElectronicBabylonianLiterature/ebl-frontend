import { parse, stringify } from 'query-string'

export const MAP_URL_STATE_VERSION = 1
export const MAX_FILTER_LENGTH = 200

const VERSION_PARAM = 'mv'
const FILTER_PARAM = 'findspot'

export interface MapUrlState {
  readonly version: number
  readonly filter: string
}

export const DEFAULT_MAP_URL_STATE: MapUrlState = {
  version: MAP_URL_STATE_VERSION,
  filter: '',
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
    filter: asString(query[FILTER_PARAM]).slice(0, MAX_FILTER_LENGTH),
  }
}

export function serializeMapUrlState(state: MapUrlState): string {
  const filter = state.filter.slice(0, MAX_FILTER_LENGTH)

  if (!filter) {
    return ''
  }

  return stringify(
    {
      [VERSION_PARAM]: MAP_URL_STATE_VERSION,
      [FILTER_PARAM]: filter,
    },
    { skipEmptyString: true },
  )
}
