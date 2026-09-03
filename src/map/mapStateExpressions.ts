import type { ExpressionSpecification } from 'maplibre-gl'

/**
 * The feature-state predicates every excavation paint mode shares. Hover and
 * selection are read from feature state — never from a filter or a re-created
 * source — so highlighting a polygon repaints nothing but that feature.
 */
export const SELECTED: ExpressionSpecification = [
  'boolean',
  ['feature-state', 'selected'],
  false,
]

export const HOVERED: ExpressionSpecification = [
  'boolean',
  ['feature-state', 'hover'],
  false,
]

export function stateNumber(key: string): ExpressionSpecification {
  return ['coalesce', ['feature-state', key], 0]
}
