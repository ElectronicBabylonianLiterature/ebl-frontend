import type { ActiveHistoricalOverlay } from './historicalOverlays'

/**
 * Split-screen swipe is absent deliberately: MapLibre 5 raster layers expose no
 * screen-space clipping, so a swipe needs a second synchronized WebGL map. See
 * docs/map-advanced-frontend-features.md.
 */
export type ComparisonMode = 'off' | 'opacity'
export type ComparisonSide = 'left' | 'right'

export const DEFAULT_BLEND_POSITION = 0.5
export const MIN_BLEND_POSITION = 0
export const MAX_BLEND_POSITION = 1
export const BLEND_KEYBOARD_STEP = 0.05

export interface ComparisonState {
  readonly mode: ComparisonMode
  readonly leftOverlayId: string | null
  readonly rightOverlayId: string | null
  readonly blendPosition: number
  readonly soloSide: ComparisonSide | null
}

export const DEFAULT_COMPARISON_STATE: ComparisonState = {
  mode: 'off',
  leftOverlayId: null,
  rightOverlayId: null,
  blendPosition: DEFAULT_BLEND_POSITION,
  soloSide: null,
}

export function clampBlendPosition(value: number): number {
  return Number.isFinite(value)
    ? Math.min(Math.max(value, MIN_BLEND_POSITION), MAX_BLEND_POSITION)
    : DEFAULT_BLEND_POSITION
}

export function sideLabel(
  state: ComparisonState,
  side: ComparisonSide,
): string {
  const overlayId = side === 'left' ? state.leftOverlayId : state.rightOverlayId
  const position = side === 'left' ? 'Left' : 'Right'

  return overlayId === null
    ? `${position}: base map`
    : `${position}: historical overlay`
}

/**
 * A comparison is only meaningful once the two sides differ. `left = null`
 * means the base map, so a single overlay on the right is a valid comparison.
 */
export function isComparisonReady(state: ComparisonState): boolean {
  return state.mode !== 'off' && state.leftOverlayId !== state.rightOverlayId
}

function sideOpacity(state: ComparisonState, side: ComparisonSide): number {
  if (state.soloSide !== null) return state.soloSide === side ? 1 : 0
  return side === 'left' ? 1 - state.blendPosition : state.blendPosition
}

/**
 * Cross-fade comparison keeps both overlays on the single map and blends them,
 * so no second WebGL context is created.
 */
export function comparisonOverlays(
  state: ComparisonState,
): readonly ActiveHistoricalOverlay[] {
  if (!isComparisonReady(state)) return []

  const sides: readonly ComparisonSide[] = ['left', 'right']

  return sides.flatMap((side) => {
    const id = side === 'left' ? state.leftOverlayId : state.rightOverlayId
    const opacity = sideOpacity(state, side)

    return id === null || opacity === 0 ? [] : [{ id, opacity, visible: true }]
  })
}

export function withBlendPosition(
  state: ComparisonState,
  position: number,
): ComparisonState {
  return { ...state, blendPosition: clampBlendPosition(position) }
}

export function withSolo(
  state: ComparisonState,
  side: ComparisonSide | null,
): ComparisonState {
  return { ...state, soloSide: state.soloSide === side ? null : side }
}

export function withSide(
  state: ComparisonState,
  side: ComparisonSide,
  overlayId: string | null,
): ComparisonState {
  return side === 'left'
    ? { ...state, leftOverlayId: overlayId }
    : { ...state, rightOverlayId: overlayId }
}

export function withMode(
  state: ComparisonState,
  mode: ComparisonMode,
): ComparisonState {
  return mode === 'off'
    ? { ...DEFAULT_COMPARISON_STATE }
    : { ...state, mode, soloSide: null }
}
