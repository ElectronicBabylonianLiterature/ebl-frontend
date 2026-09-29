import { parse, stringify } from 'query-string'
import {
  type MapSelection,
  parseMapSelection,
  serializeMapSelection,
} from 'map/mapSelection'
import {
  type MapVisualizationMode,
  isMapVisualizationMode,
} from 'map/mapChoroplethScale'

export const MAP_URL_STATE_VERSION = 1
export const MAX_FILTER_LENGTH = 200

const VERSION_PARAM = 'mv'
const FILTER_PARAM = 'findspot'
const AREAS_PARAM = 'areas'
const SELECTION_PARAM = 'selected'
const VISUALIZATION_PARAM = 'viz'
const TERRAIN_PARAM = 'terrain'
const SURROGATE_CODE_UNIT = /^[\uD800-\uDFFF]$/

const DEFAULT_VISUALIZATION: MapVisualizationMode = 'mapped'

export interface MapUrlState {
  readonly version: number
  readonly filter: string
  readonly showExcavationAreas: boolean
  readonly selection: MapSelection | null
  readonly visualization: MapVisualizationMode
  readonly terrain: boolean
}

export const DEFAULT_MAP_URL_STATE: MapUrlState = {
  version: MAP_URL_STATE_VERSION,
  filter: '',
  showExcavationAreas: false,
  selection: null,
  visualization: DEFAULT_VISUALIZATION,
  terrain: false,
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
    selection: state.selection,
    visualization: isMapVisualizationMode(state.visualization)
      ? state.visualization
      : DEFAULT_VISUALIZATION,
    terrain: state.terrain === true,
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
    selection: parseMapSelection(asString(query[SELECTION_PARAM])),
    visualization: asString(query[VISUALIZATION_PARAM]) as MapVisualizationMode,
    terrain: asString(query[TERRAIN_PARAM]) === '1',
  })
}

export function serializeMapUrlState(state: MapUrlState): string {
  const normalized = normalizeMapUrlState(state)
  const serializedSelection = serializeMapSelection(normalized.selection)

  if (
    !normalized.filter &&
    !normalized.showExcavationAreas &&
    !serializedSelection &&
    normalized.visualization === DEFAULT_VISUALIZATION &&
    !normalized.terrain
  ) {
    return ''
  }

  return stringify(
    {
      [VERSION_PARAM]: MAP_URL_STATE_VERSION,
      [FILTER_PARAM]: normalized.filter,
      [AREAS_PARAM]: normalized.showExcavationAreas ? '1' : undefined,
      [SELECTION_PARAM]: serializedSelection || undefined,
      [VISUALIZATION_PARAM]:
        normalized.visualization === DEFAULT_VISUALIZATION
          ? undefined
          : normalized.visualization,
      [TERRAIN_PARAM]: normalized.terrain ? '1' : undefined,
    },
    { skipEmptyString: true },
  )
}

export function mergeMapUrlStateIntoSearch(
  search: string,
  state: MapUrlState,
): string {
  const parameters = new URLSearchParams(search)
  const normalized = normalizeMapUrlState(state)
  const serializedSelection = serializeMapSelection(normalized.selection)

  parameters.delete(VERSION_PARAM)
  parameters.delete(FILTER_PARAM)
  parameters.delete(AREAS_PARAM)
  parameters.delete(SELECTION_PARAM)
  parameters.delete(VISUALIZATION_PARAM)
  parameters.delete(TERRAIN_PARAM)
  if (
    normalized.filter ||
    normalized.showExcavationAreas ||
    serializedSelection ||
    normalized.visualization !== DEFAULT_VISUALIZATION ||
    normalized.terrain
  ) {
    parameters.set(VERSION_PARAM, String(MAP_URL_STATE_VERSION))
  }
  if (normalized.filter) parameters.set(FILTER_PARAM, normalized.filter)
  if (normalized.showExcavationAreas) parameters.set(AREAS_PARAM, '1')
  if (serializedSelection) parameters.set(SELECTION_PARAM, serializedSelection)
  if (normalized.visualization !== DEFAULT_VISUALIZATION) {
    parameters.set(VISUALIZATION_PARAM, normalized.visualization)
  }
  if (normalized.terrain) parameters.set(TERRAIN_PARAM, '1')

  return parameters.toString()
}
