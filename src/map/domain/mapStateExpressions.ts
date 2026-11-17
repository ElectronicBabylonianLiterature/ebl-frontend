import type { ExpressionSpecification } from 'maplibre-gl'

export function stateBoolean(
  key: string,
  fallback = false,
): ExpressionSpecification {
  return ['boolean', ['feature-state', key], fallback]
}

export const SELECTED: ExpressionSpecification = stateBoolean('selected')
export const HOVERED: ExpressionSpecification = stateBoolean('hover')

export function stateNumber(key: string): ExpressionSpecification {
  return ['coalesce', ['feature-state', key], 0]
}
