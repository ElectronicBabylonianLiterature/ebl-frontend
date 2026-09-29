import type { ExpressionSpecification } from 'maplibre-gl'
import {
  HOVERED,
  SELECTED,
  stateBoolean,
  stateNumber,
} from 'map/mapStateExpressions'
import {
  COLOR_DENSITY_UNCLASSIFIED,
  COLOR_MAPPED_FRAGMENTS,
  COLOR_MAPPED_ZERO,
  COLOR_SELECTED,
  COLOR_UNAVAILABLE,
  COLOR_UNMAPPED,
  DASH_MAPPED,
  DASH_UNAVAILABLE,
  DASH_UNMAPPED,
  OUTLINE_MAPPED,
  OUTLINE_SELECTED,
  OUTLINE_UNAVAILABLE,
  OUTLINE_UNMAPPED,
} from 'map/mapPaintColors'

export * from 'map/mapPaintColors'

export type ChoroplethValueKey =
  | 'accessibleFragmentCount'
  | 'densityPerSquareKm'

export interface ChoroplethScale {
  readonly valueKey: ChoroplethValueKey
  readonly breaks: readonly number[]
  readonly colors: readonly string[]
}

const IS_UNAVAILABLE: ExpressionSpecification = [
  '!',
  stateBoolean('dataAvailable'),
]
const IS_UNMAPPED: ExpressionSpecification = [
  '==',
  stateNumber('findspotCount'),
  0,
]

function isDensityUnclassified(
  scale: ChoroplethScale | null,
): ExpressionSpecification | boolean {
  return scale?.valueKey === 'densityPerSquareKm'
    ? ['!', stateBoolean('densityAvailable')]
    : false
}

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
      IS_UNAVAILABLE,
      COLOR_UNAVAILABLE,
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
    IS_UNAVAILABLE,
    COLOR_UNAVAILABLE,
    IS_UNMAPPED,
    COLOR_UNMAPPED,
    isDensityUnclassified(scale),
    COLOR_DENSITY_UNCLASSIFIED,
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
    IS_UNAVAILABLE,
    0.12,
    IS_UNMAPPED,
    0.07,
    isDensityUnclassified(scale),
    0.2,
    scale === null ? 0.24 : 0.34,
  ]
}

export function excavationOutlineColor(
  scale: ChoroplethScale | null = null,
): ExpressionSpecification {
  return [
    'case',
    SELECTED,
    OUTLINE_SELECTED,
    IS_UNAVAILABLE,
    OUTLINE_UNAVAILABLE,
    IS_UNMAPPED,
    OUTLINE_UNMAPPED,
    isDensityUnclassified(scale),
    OUTLINE_UNAVAILABLE,
    OUTLINE_MAPPED,
  ]
}

export function excavationOutlineWidth(
  scale: ChoroplethScale | null,
): ExpressionSpecification {
  if (scale === null) {
    return ['case', SELECTED, 3.5, HOVERED, 2.4, IS_UNAVAILABLE, 1, 1.2]
  }

  return [
    'case',
    SELECTED,
    3.5,
    HOVERED,
    2.4,
    IS_UNAVAILABLE,
    1,
    IS_UNMAPPED,
    1,
    isDensityUnclassified(scale),
    1,
    ['+', 1.2, ['*', 0.7, stepClassIndex(scale)]],
  ]
}

export function excavationOutlineDash(
  scale: ChoroplethScale | null = null,
): ExpressionSpecification {
  return [
    'case',
    IS_UNAVAILABLE,
    ['literal', [...DASH_UNAVAILABLE]],
    IS_UNMAPPED,
    ['literal', [...DASH_UNMAPPED]],
    isDensityUnclassified(scale),
    ['literal', [...DASH_UNAVAILABLE]],
    ['literal', [...DASH_MAPPED]],
  ]
}

export function excavationOutlineOpacity(): ExpressionSpecification {
  return ['case', SELECTED, 0.95, IS_UNAVAILABLE, 0.55, IS_UNMAPPED, 0.45, 0.85]
}
