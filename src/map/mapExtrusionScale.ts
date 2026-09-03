import type { ExpressionSpecification } from 'maplibre-gl'
import type { MapExtrusionMetric } from './map3dState'
import type { PolygonVisualizationValues } from './mapVisualizationValues'
import { stateNumber } from './mapStateExpressions'
export const MAX_EXTRUSION_UNITS = 600
/** A mapped polygon with a zero value still needs a visible footprint. */
export const MAPPED_ZERO_EXTRUSION_UNITS = 6
export const LOG_STOP_COUNT = 5
/** Outliers are clamped at this quantile so the rest stays readable. */
export const REFERENCE_QUANTILE = 0.95

export type ExtrusionScaleMethod = 'linear' | 'logarithmic'

export interface ExtrusionScale {
  readonly metric: MapExtrusionMetric
  readonly method: ExtrusionScaleMethod
  readonly valueKey: keyof MetricValue
  readonly referenceValue: number
  readonly maxHeightUnits: number
}

interface MetricValue {
  readonly findspotCount: number
  readonly accessibleFragmentCount: number
  readonly densityPerSquareKm: number | null
}

const METRIC_KEYS: Readonly<Record<MapExtrusionMetric, keyof MetricValue>> = {
  'accessible-fragments': 'accessibleFragmentCount',
  'mapped-findspots': 'findspotCount',
  'log-fragments': 'accessibleFragmentCount',
  'fragment-density': 'densityPerSquareKm',
}
const METRIC_METHODS: Readonly<
  Record<MapExtrusionMetric, ExtrusionScaleMethod>
> = {
  'accessible-fragments': 'logarithmic',
  'mapped-findspots': 'linear',
  'log-fragments': 'logarithmic',
  'fragment-density': 'logarithmic',
}

export function extrusionValueKey(
  metric: MapExtrusionMetric,
): keyof MetricValue {
  return METRIC_KEYS[metric]
}

function positiveAscending(
  values: PolygonVisualizationValues,
  key: keyof MetricValue,
): readonly number[] {
  return [...values.values()]
    .map((value) => value[key])
    .filter((value): value is number => typeof value === 'number' && value > 0)
    .sort((left, right) => left - right)
}

function quantile(sorted: readonly number[], fraction: number): number {
  const position = (sorted.length - 1) * fraction
  const lower = Math.floor(position)
  const upper = Math.ceil(position)

  return lower === upper
    ? sorted[lower]
    : sorted[lower] + (position - lower) * (sorted[upper] - sorted[lower])
}
export function buildExtrusionScale(
  metric: MapExtrusionMetric,
  values: PolygonVisualizationValues,
  userScale = 1,
): ExtrusionScale | null {
  const valueKey = extrusionValueKey(metric)
  const sorted = positiveAscending(values, valueKey)
  if (sorted.length === 0) return null

  return {
    metric,
    method: METRIC_METHODS[metric],
    valueKey,
    referenceValue: Math.max(quantile(sorted, REFERENCE_QUANTILE), sorted[0]),
    maxHeightUnits: MAX_EXTRUSION_UNITS * userScale,
  }
}

function logStops(scale: ExtrusionScale): readonly [number, number][] {
  const span = Math.log1p(scale.referenceValue)

  return Array.from({ length: LOG_STOP_COUNT + 1 }, (_entry, index) => {
    const fraction = index / LOG_STOP_COUNT
    return [Math.expm1(span * fraction), scale.maxHeightUnits * fraction] as [
      number,
      number,
    ]
  })
}

function stops(scale: ExtrusionScale): readonly [number, number][] {
  return scale.method === 'linear'
    ? [
        [0, 0],
        [scale.referenceValue, scale.maxHeightUnits],
      ]
    : logStops(scale)
}

/** Height for one value, in analytical units. Clamped at both ends. */
export function extrusionHeight(scale: ExtrusionScale, value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0

  const points = stops(scale)
  const last = points[points.length - 1]
  if (value >= last[0]) return last[1]

  const upperIndex = points.findIndex((point) => point[0] >= value)
  const [lowerValue, lowerHeight] = points[upperIndex - 1]
  const [upperValue, upperHeight] = points[upperIndex]
  const ratio = (value - lowerValue) / (upperValue - lowerValue)

  return lowerHeight + ratio * (upperHeight - lowerHeight)
}
export function extrusionHeightExpression(
  scale: ExtrusionScale | null,
): ExpressionSpecification {
  if (scale === null)
    return ['literal', 0] as unknown as ExpressionSpecification

  const interpolation = [
    'interpolate',
    ['linear'],
    stateNumber(scale.valueKey),
    ...stops(scale).flat(),
  ] as unknown as ExpressionSpecification

  return [
    'case',
    ['==', stateNumber('findspotCount'), 0],
    0,
    ['==', stateNumber(scale.valueKey), 0],
    MAPPED_ZERO_EXTRUSION_UNITS,
    interpolation,
  ] as unknown as ExpressionSpecification
}

export interface ExtrusionLegendSample {
  readonly label: string
  readonly value: number
  readonly heightFraction: number
}

export function extrusionLegendSamples(
  scale: ExtrusionScale,
): readonly ExtrusionLegendSample[] {
  return [0.25, 0.5, 1].map((fraction) => {
    const value =
      scale.method === 'linear'
        ? scale.referenceValue * fraction
        : Math.expm1(Math.log1p(scale.referenceValue) * fraction)

    return {
      label:
        fraction === 1
          ? `${Math.round(value).toLocaleString('en')} and above`
          : Math.round(value).toLocaleString('en'),
      value,
      heightFraction: fraction,
    }
  })
}
