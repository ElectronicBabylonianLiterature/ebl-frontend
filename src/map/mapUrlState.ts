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

const VERSION_PARAM = 'mv'
const FILTER_PARAM = 'findspot'
const AREAS_PARAM = 'areas'
const SELECTION_PARAM = 'selected'
const VISUALIZATION_PARAM = 'viz'
const TERRAIN_PARAM = 'terrain'

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

  const visualization = asString(query[VISUALIZATION_PARAM])

  return {
    version: MAP_URL_STATE_VERSION,
    filter: asString(query[FILTER_PARAM]),
    showExcavationAreas: asString(query[AREAS_PARAM]) === '1',
    selection: parseMapSelection(asString(query[SELECTION_PARAM])),
    visualization: isMapVisualizationMode(visualization)
      ? visualization
      : DEFAULT_VISUALIZATION,
    terrain: asString(query[TERRAIN_PARAM]) === '1',
  }
}

export function serializeMapUrlState(state: MapUrlState): string {
  return stringify(
    {
      [VERSION_PARAM]: MAP_URL_STATE_VERSION,
      [FILTER_PARAM]: state.filter || undefined,
      [AREAS_PARAM]: state.showExcavationAreas ? '1' : undefined,
      [SELECTION_PARAM]: serializeMapSelection(state.selection) || undefined,
      [VISUALIZATION_PARAM]:
        state.visualization === DEFAULT_VISUALIZATION
          ? undefined
          : state.visualization,
      [TERRAIN_PARAM]: state.terrain ? '1' : undefined,
    },
    { skipEmptyString: true },
  )
}
