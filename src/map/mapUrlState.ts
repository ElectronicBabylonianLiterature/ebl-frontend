import { parse, stringify } from 'query-string'
import type { ActiveHistoricalOverlay } from './historicalOverlays'
import type { MapSelection } from './mapSelection'
import {
  type MapVisualizationMode,
  isMapVisualizationMode,
} from './mapChoroplethScale'
import { INITIAL_CENTER, INITIAL_ZOOM } from './mapCamera'
import {
  DEFAULT_MAP_TOOL_URL_STATE,
  type MapToolUrlState,
  parseMapToolUrlState,
  serializeMapToolUrlState,
} from './mapToolUrlState'

export const MAP_URL_STATE_VERSION = 1
export const MAX_MAP_URL_LENGTH = 2000

export type MapLayerKey = 'boundaries' | 'areas'

const MAP_LAYER_KEYS: readonly MapLayerKey[] = ['boundaries', 'areas']

export interface MapCameraState {
  readonly center: readonly [number, number]
  readonly zoom: number
  readonly bearing: number
  readonly pitch: number
}

export interface MapUrlState {
  readonly camera: MapCameraState
  readonly layers: readonly MapLayerKey[]
  readonly overlays: readonly ActiveHistoricalOverlay[]
  readonly selection: MapSelection | null
  readonly siteFilter: string
  readonly visualization: MapVisualizationMode
  readonly tools: MapToolUrlState
}

export const DEFAULT_MAP_URL_STATE: MapUrlState = {
  camera: {
    center: INITIAL_CENTER,
    zoom: INITIAL_ZOOM,
    bearing: 0,
    pitch: 0,
  },
  layers: ['boundaries'],
  overlays: [],
  selection: null,
  siteFilter: '',
  visualization: 'mapped',
  tools: DEFAULT_MAP_TOOL_URL_STATE,
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function firstValue(value: unknown): string | null {
  const candidate = Array.isArray(value) ? value[0] : value
  return typeof candidate === 'string' ? candidate : null
}

function parseNumber(value: string | null | undefined): number | null {
  if (value === undefined || value === null || value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseCamera(query: Record<string, unknown>): MapCameraState {
  const [longitude, latitude] = String(firstValue(query.c) ?? '')
    .split(',')
    .map((entry) => parseNumber(entry))
  const zoom = parseNumber(firstValue(query.z))
  const bearing = parseNumber(firstValue(query.b))
  const pitch = parseNumber(firstValue(query.p))
  const fallback = DEFAULT_MAP_URL_STATE.camera

  return {
    center:
      longitude === null || latitude === null
        ? fallback.center
        : [clamp(longitude, -180, 180), clamp(latitude, -85.0511, 85.0511)],
    zoom: zoom === null ? fallback.zoom : clamp(zoom, 0, 24),
    bearing: bearing === null ? fallback.bearing : clamp(bearing, -180, 180),
    pitch: pitch === null ? fallback.pitch : clamp(pitch, 0, 85),
  }
}

function parseLayers(value: string | null): readonly MapLayerKey[] {
  if (value === null) return DEFAULT_MAP_URL_STATE.layers

  const requested = new Set(value.split(',').map((entry) => entry.trim()))
  return MAP_LAYER_KEYS.filter((key) => requested.has(key))
}

function parseOverlays(
  value: string | null,
  knownOverlayIds: ReadonlySet<string>,
): readonly ActiveHistoricalOverlay[] {
  if (!value) return []

  const seen = new Set<string>()
  return value
    .split(',')
    .flatMap((entry) => {
      const [id, opacity] = entry.split(':')
      const parsedOpacity = parseNumber(opacity)
      if (!knownOverlayIds.has(id) || seen.has(id)) return []

      seen.add(id)
      return [
        {
          id,
          opacity: parsedOpacity === null ? 1 : clamp(parsedOpacity, 0, 1),
          visible: true,
        },
      ]
    })
    .slice(0, 20)
}

function parseSelection(
  query: Record<string, unknown>,
  knownPolygonIds: ReadonlySet<string> | null,
): MapSelection | null {
  const polygonId = firstValue(query.area)
  if (polygonId) {
    return knownPolygonIds && !knownPolygonIds.has(polygonId)
      ? null
      : { type: 'excavation-area', polygonId }
  }

  const provenanceId = firstValue(query.site)
  return provenanceId ? { type: 'site', provenanceId } : null
}

function parseVisualization(value: string | null): MapVisualizationMode {
  return isMapVisualizationMode(value)
    ? value
    : DEFAULT_MAP_URL_STATE.visualization
}

export interface MapUrlStateContext {
  readonly knownOverlayIds: ReadonlySet<string>
  readonly knownPolygonIds?: ReadonlySet<string> | null
}

export function parseMapUrlState(
  search: string,
  context: MapUrlStateContext,
): MapUrlState {
  const query = parse(search) as Record<string, unknown>
  const version = parseNumber(firstValue(query.v))

  if (version !== MAP_URL_STATE_VERSION) return DEFAULT_MAP_URL_STATE

  return {
    camera: parseCamera(query),
    layers: parseLayers(firstValue(query.l)),
    overlays: parseOverlays(firstValue(query.o), context.knownOverlayIds),
    selection: parseSelection(query, context.knownPolygonIds ?? null),
    siteFilter: (firstValue(query.q) ?? '').slice(0, 120),
    visualization: parseVisualization(firstValue(query.viz)),
    tools: parseMapToolUrlState(
      {
        t: firstValue(query.t),
        cmp: firstValue(query.cmp),
        yr: firstValue(query.yr),
        d: firstValue(query.d),
      },
      context.knownOverlayIds,
    ),
  }
}

function serializeOverlays(
  overlays: readonly ActiveHistoricalOverlay[],
): string | undefined {
  const visible = overlays.filter((overlay) => overlay.visible)
  return visible.length === 0
    ? undefined
    : visible
        .map((overlay) => `${overlay.id}:${round(overlay.opacity, 2)}`)
        .join(',')
}

function serializeQuery(state: MapUrlState): Record<string, string> {
  const { camera, selection } = state
  const overlays = serializeOverlays(state.overlays)

  return {
    v: String(MAP_URL_STATE_VERSION),
    c: `${round(camera.center[0], 5)},${round(camera.center[1], 5)}`,
    z: String(round(camera.zoom, 2)),
    ...(camera.bearing === 0 ? {} : { b: String(round(camera.bearing, 1)) }),
    ...(camera.pitch === 0 ? {} : { p: String(round(camera.pitch, 1)) }),
    l: [...state.layers].sort().join(','),
    ...(overlays === undefined ? {} : { o: overlays }),
    ...(selection?.type === 'site' ? { site: selection.provenanceId } : {}),
    ...(selection?.type === 'excavation-area'
      ? { area: selection.polygonId }
      : {}),
    ...(state.siteFilter === '' ? {} : { q: state.siteFilter }),
    ...(state.visualization === DEFAULT_MAP_URL_STATE.visualization
      ? {}
      : { viz: state.visualization }),
    ...serializeMapToolUrlState(state.tools),
  }
}

export function serializeMapUrlState(state: MapUrlState): string {
  const full = stringify(serializeQuery(state), { sort: false })
  return full.length <= MAX_MAP_URL_LENGTH
    ? full
    : stringify(serializeQuery({ ...state, overlays: [] }), { sort: false })
}
