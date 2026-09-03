import type { ExpressionSpecification } from 'maplibre-gl'
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
