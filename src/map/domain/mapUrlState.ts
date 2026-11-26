import { parse } from 'common/utils/queryString'
import {
  type MapSelection,
  parseMapSelection,
  serializeMapSelection,
} from 'map/domain/mapSelection'
import {
  type MapVisualizationMode,
  isMapVisualizationMode,
} from 'map/domain/mapChoroplethScale'

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
  readonly terrain: boolean
  readonly visualization: MapVisualizationMode
}

export const DEFAULT_MAP_URL_STATE: MapUrlState = {
  version: MAP_URL_STATE_VERSION,
  filter: '',
  showExcavationAreas: true,
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
    terrain: state.terrain === true,
    version: MAP_URL_STATE_VERSION,
    filter: normalizeMapFilter(state.filter),
    showExcavationAreas: state.showExcavationAreas,
    selection: state.selection ?? null,
    visualization: isMapVisualizationMode(state.visualization)
      ? state.visualization
      : DEFAULT_VISUALIZATION,
  }
}

function asString(value: string | (string | null)[] | null): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export function parseMapUrlState(search: string): MapUrlState {
  const query = parse(search)
  const version = asString(query[VERSION_PARAM])
  if (version && version !== String(MAP_URL_STATE_VERSION)) {
    return DEFAULT_MAP_URL_STATE
  }
  return normalizeMapUrlState({
    version: MAP_URL_STATE_VERSION,
    terrain: asString(query[TERRAIN_PARAM]) === '1',
    filter: asString(query[FILTER_PARAM]),
    showExcavationAreas: asString(query[AREAS_PARAM]) !== '0',
    selection: parseMapSelection(asString(query[SELECTION_PARAM])),
    visualization: asString(query[VISUALIZATION_PARAM]) as MapVisualizationMode,
  })
}

export function serializeMapUrlState(state: MapUrlState): string {
  return mergeMapUrlStateIntoSearch('', state)
}

function needsVersionParameter(
  state: MapUrlState,
  hasExplicitAreas: boolean,
  serializedSelection: string,
): boolean {
  const hasNonDefaultState =
    Boolean(state.filter) ||
    !state.showExcavationAreas ||
    state.visualization !== DEFAULT_VISUALIZATION ||
    state.terrain
  return hasNonDefaultState || hasExplicitAreas || serializedSelection !== ''
}

export function mergeMapUrlStateIntoSearch(
  search: string,
  state: MapUrlState,
): string {
  const parameters = new URLSearchParams(search)
  const normalized = normalizeMapUrlState(state)
  const serializedSelection = serializeMapSelection(normalized.selection)
  const hasExplicitAreas = parameters.has(AREAS_PARAM)
  parameters.delete(VERSION_PARAM)
  parameters.delete(FILTER_PARAM)
  parameters.delete(AREAS_PARAM)
  parameters.delete(SELECTION_PARAM)
  parameters.delete(TERRAIN_PARAM)
  parameters.delete(VISUALIZATION_PARAM)
  if (
    needsVersionParameter(normalized, hasExplicitAreas, serializedSelection)
  ) {
    parameters.set(VERSION_PARAM, String(MAP_URL_STATE_VERSION))
  }
  if (normalized.filter) parameters.set(FILTER_PARAM, normalized.filter)
  if (
    normalized.filter ||
    !normalized.showExcavationAreas ||
    hasExplicitAreas
  ) {
    parameters.set(AREAS_PARAM, normalized.showExcavationAreas ? '1' : '0')
  }
  if (serializedSelection) parameters.set(SELECTION_PARAM, serializedSelection)
  if (normalized.visualization !== DEFAULT_VISUALIZATION) {
    parameters.set(VISUALIZATION_PARAM, normalized.visualization)
  }
  if (normalized.terrain) parameters.set(TERRAIN_PARAM, '1')
  return parameters.toString()
}
