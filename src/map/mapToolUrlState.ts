import {
  type ComparisonMode,
  type ComparisonState,
  DEFAULT_COMPARISON_STATE,
  clampBlendPosition,
} from './mapComparison'
import {
  DEFAULT_TIMELINE_STATE,
  type PublicationTimelineState,
} from './overlayTimelineFilter'
import { EARLIEST_PLAUSIBLE_PUBLICATION_YEAR } from './overlayPublicationDates'
import {
  DEFAULT_MAP_3D_STATE,
  type Map3dState,
  parseMap3dState,
  serializeMap3dState,
} from './map3dState'

export interface MapToolUrlState {
  readonly terrain: boolean
  readonly comparison: ComparisonState
  readonly timeline: PublicationTimelineState
  readonly threeD: Map3dState
}

export const DEFAULT_MAP_TOOL_URL_STATE: MapToolUrlState = {
  terrain: false,
  comparison: DEFAULT_COMPARISON_STATE,
  timeline: DEFAULT_TIMELINE_STATE,
  threeD: DEFAULT_MAP_3D_STATE,
}

const COMPARISON_MODES: readonly ComparisonMode[] = ['opacity']

function isComparisonMode(value: string): value is ComparisonMode {
  return (COMPARISON_MODES as readonly string[]).includes(value)
}

function parseYear(value: string): number | null {
  const year = Number(value)
  return Number.isInteger(year) &&
    year >= EARLIEST_PLAUSIBLE_PUBLICATION_YEAR &&
    year <= 9999
    ? year
    : null
}

function overlayId(
  value: string | undefined,
  knownOverlayIds: ReadonlySet<string>,
): string | null {
  return value !== undefined && knownOverlayIds.has(value) ? value : null
}

export function parseComparisonState(
  value: string | null,
  knownOverlayIds: ReadonlySet<string>,
): ComparisonState {
  if (!value) return DEFAULT_COMPARISON_STATE

  const [mode, left, right, position] = value.split(':')
  if (!isComparisonMode(mode)) return DEFAULT_COMPARISON_STATE

  return {
    mode,
    leftOverlayId: overlayId(left, knownOverlayIds),
    rightOverlayId: overlayId(right, knownOverlayIds),
    blendPosition: clampBlendPosition(Number(position)),
    soloSide: null,
  }
}

export function serializeComparisonState(
  state: ComparisonState,
): string | undefined {
  return state.mode === 'off'
    ? undefined
    : [
        state.mode,
        state.leftOverlayId ?? '',
        state.rightOverlayId ?? '',
        String(Math.round(state.blendPosition * 100) / 100),
      ].join(':')
}

export function parseTimelineState(
  value: string | null,
): PublicationTimelineState {
  if (!value) return DEFAULT_TIMELINE_STATE

  const [range, undated] = value.split(':')
  const [start, end] = range.split(',')
  const startYear = parseYear(start ?? '')
  const endYear = parseYear(end ?? '')

  return {
    startYear,
    endYear:
      startYear !== null && endYear !== null && endYear < startYear
        ? startYear
        : endYear,
    includeUndated: undated !== '0',
  }
}

export function serializeTimelineState(
  state: PublicationTimelineState,
): string | undefined {
  if (
    state.startYear === null &&
    state.endYear === null &&
    state.includeUndated
  ) {
    return undefined
  }

  return `${state.startYear ?? ''},${state.endYear ?? ''}:${
    state.includeUndated ? '1' : '0'
  }`
}

export function parseMapToolUrlState(
  query: Readonly<Record<string, string | null>>,
  knownOverlayIds: ReadonlySet<string>,
): MapToolUrlState {
  return {
    terrain: query.t === '1',
    comparison: parseComparisonState(query.cmp ?? null, knownOverlayIds),
    timeline: parseTimelineState(query.yr ?? null),
    threeD: parseMap3dState(query.d ?? null),
  }
}

export function serializeMapToolUrlState(
  state: MapToolUrlState,
): Record<string, string> {
  const comparison = serializeComparisonState(state.comparison)
  const timeline = serializeTimelineState(state.timeline)
  const threeD = serializeMap3dState(state.threeD)

  return {
    ...(state.terrain ? { t: '1' } : {}),
    ...(comparison === undefined ? {} : { cmp: comparison }),
    ...(timeline === undefined ? {} : { yr: timeline }),
    ...(threeD === undefined ? {} : { d: threeD }),
  }
}
