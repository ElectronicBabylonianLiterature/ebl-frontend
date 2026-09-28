import { parse, stringify } from 'query-string'

export const MAP_URL_STATE_VERSION = 1
export const MAX_FILTER_LENGTH = 200

const VERSION_PARAM = 'mv'
const FILTER_PARAM = 'findspot'
const AREAS_PARAM = 'areas'
const SURROGATE_CODE_UNIT = /^[\uD800-\uDFFF]$/

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

export function normalizeMapFilter(filter: string): string {
  return Array.from(filter, (character) =>
    SURROGATE_CODE_UNIT.test(character) ? '\uFFFD' : character,
  )
    .slice(0, MAX_FILTER_LENGTH)
    .join('')
}

export function normalizeMapUrlState(state: MapUrlState): MapUrlState {
  return {
    version: MAP_URL_STATE_VERSION,
    filter: normalizeMapFilter(state.filter),
    showExcavationAreas: state.showExcavationAreas,
  }
}

function asString(value: string | (string | null)[] | null): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export function parseMapUrlState(search: string): MapUrlState {
  const query = parse(search)
  const version = asString(query[VERSION_PARAM])

  if (version !== String(MAP_URL_STATE_VERSION)) {
    return DEFAULT_MAP_URL_STATE
  }

  return normalizeMapUrlState({
    version: MAP_URL_STATE_VERSION,
    filter: asString(query[FILTER_PARAM]),
    showExcavationAreas: asString(query[AREAS_PARAM]) === '1',
  })
}

export function serializeMapUrlState(state: MapUrlState): string {
  const { filter, showExcavationAreas } = normalizeMapUrlState(state)

  if (!filter && !showExcavationAreas) {
    return ''
  }

  return stringify(
    {
      [VERSION_PARAM]: MAP_URL_STATE_VERSION,
      [FILTER_PARAM]: filter,
      [AREAS_PARAM]: showExcavationAreas ? '1' : undefined,
    },
    { skipEmptyString: true },
  )
}

export function mergeMapUrlStateIntoSearch(
  search: string,
  state: MapUrlState,
): string {
  const parameters = new URLSearchParams(search)
  const { filter, showExcavationAreas } = normalizeMapUrlState(state)

  parameters.delete(VERSION_PARAM)
  parameters.delete(FILTER_PARAM)
  parameters.delete(AREAS_PARAM)
  if (filter || showExcavationAreas) {
    parameters.set(VERSION_PARAM, String(MAP_URL_STATE_VERSION))
  }
  if (filter) parameters.set(FILTER_PARAM, filter)
  if (showExcavationAreas) parameters.set(AREAS_PARAM, '1')

  return parameters.toString()
}
