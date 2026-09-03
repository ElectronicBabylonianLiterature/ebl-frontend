import type { ExpressionSpecification } from 'maplibre-gl'
import { HOVERED, SELECTED, stateNumber } from './mapStateExpressions'
import {
  COLOR_MAPPED_FRAGMENTS,
  COLOR_MAPPED_ZERO,
  COLOR_SELECTED,
  COLOR_UNMAPPED,
  DASH_MAPPED,
  DASH_UNMAPPED,
  OUTLINE_MAPPED,
  OUTLINE_SELECTED,
  OUTLINE_UNMAPPED,
} from './mapPaintColors'

export * from './mapPaintColors'

export type ChoroplethValueKey =
  | 'accessibleFragmentCount'
  | 'densityPerSquareKm'

export interface ChoroplethScale {
  readonly valueKey: ChoroplethValueKey
  readonly breaks: readonly number[]
  readonly colors: readonly string[]
}

const IS_UNMAPPED: ExpressionSpecification = [
  '==',
  stateNumber('findspotCount'),
  0,
]

function stepColors(scale: ChoroplethScale): ExpressionSpecification {
  const stops = scale.breaks.flatMap((breakValue, index) => [
    breakValue,
    scale.colors[index + 1] ?? scale.colors[scale.colors.length - 1],
  ])

  return [
    'step',
    stateNumber(scale.valueKey),
    scale.colors[0],
    ...stops,
  ] as ExpressionSpecification
}
function stepClassIndex(scale: ChoroplethScale): ExpressionSpecification {
  const stops = scale.breaks.flatMap((breakValue, index) => [
    breakValue,
    index + 1,
  ])

  return [
    'step',
    stateNumber(scale.valueKey),
    0,
    ...stops,
  ] as ExpressionSpecification
}

export function excavationFillColor(
  scale: ChoroplethScale | null,
): ExpressionSpecification {
  if (scale === null) {
    return [
      'case',
      SELECTED,
      COLOR_SELECTED,
      ['>', stateNumber('accessibleFragmentCount'), 0],
      COLOR_MAPPED_FRAGMENTS,
      ['>', stateNumber('findspotCount'), 0],
      COLOR_MAPPED_ZERO,
      COLOR_UNMAPPED,
    ]
  }

  return [
    'case',
    SELECTED,
    COLOR_SELECTED,
    IS_UNMAPPED,
    COLOR_UNMAPPED,
    ['==', stateNumber(scale.valueKey), 0],
    COLOR_MAPPED_ZERO,
    stepColors(scale),
  ]
}
export function excavationFillOpacity(
  scale: ChoroplethScale | null,
): ExpressionSpecification {
  return [
    'case',
    SELECTED,
    0.4,
    HOVERED,
    0.32,
    IS_UNMAPPED,
    0.07,
    scale === null ? 0.24 : 0.34,
  ]
}

export function excavationOutlineColor(): ExpressionSpecification {
  return [
    'case',
    SELECTED,
    OUTLINE_SELECTED,
    IS_UNMAPPED,
    OUTLINE_UNMAPPED,
    OUTLINE_MAPPED,
  ]
}
export function excavationOutlineWidth(
  scale: ChoroplethScale | null,
): ExpressionSpecification {
  if (scale === null) {
    return ['case', SELECTED, 3.5, HOVERED, 2.4, 1.2]
  }

  return [
    'case',
    SELECTED,
    3.5,
    HOVERED,
    2.4,
    IS_UNMAPPED,
    1,
    ['+', 1.2, ['*', 0.7, stepClassIndex(scale)]],
  ]
}

export function excavationOutlineDash(): ExpressionSpecification {
  return [
    'case',
    IS_UNMAPPED,
    ['literal', [...DASH_UNMAPPED]],
    ['literal', [...DASH_MAPPED]],
  ]
}

export function excavationOutlineOpacity(): ExpressionSpecification {
  return ['case', SELECTED, 0.95, IS_UNMAPPED, 0.45, 0.85]
}
