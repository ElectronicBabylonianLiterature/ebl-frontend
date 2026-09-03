import {
  type ChoroplethScale,
  type ChoroplethValueKey,
  SEQUENTIAL_COLORS,
} from './mapPaintExpressions'

export const MAP_VISUALIZATION_MODES = [
  'mapped',
  'evidence',
  'count',
  'log',
  'density',
] as const

export type MapVisualizationMode = (typeof MAP_VISUALIZATION_MODES)[number]

export const MAX_CHOROPLETH_CLASSES = SEQUENTIAL_COLORS.length

export interface ChoroplethLegendClass {
  readonly color: string
  readonly from: number
  readonly to: number | null
}

export interface ChoroplethLegend {
  readonly mode: MapVisualizationMode
  readonly unit: string
  readonly classes: readonly ChoroplethLegendClass[]
  readonly classifiedFeatureCount: number
}

const MODE_UNITS: Readonly<Record<MapVisualizationMode, string>> = {
  mapped: 'Mapped status',
  evidence: 'Strength of the spatial evidence',
  count: 'Accessible fragments',
  log: 'Accessible fragments (log scale)',
  density: 'Accessible fragments per square kilometre',
}

/** The two categorical modes classify by state, never by a numeric ramp. */
const CATEGORICAL_MODES: ReadonlySet<MapVisualizationMode> = new Set([
  'mapped',
  'evidence',
])

export function isCategoricalVisualization(
  mode: MapVisualizationMode,
): boolean {
  return CATEGORICAL_MODES.has(mode)
}

export function isMapVisualizationMode(
  value: unknown,
): value is MapVisualizationMode {
  return MAP_VISUALIZATION_MODES.includes(value as MapVisualizationMode)
}

export function visualizationValueKey(
  mode: MapVisualizationMode,
): ChoroplethValueKey {
  return mode === 'density' ? 'densityPerSquareKm' : 'accessibleFragmentCount'
}

export function visualizationUnit(mode: MapVisualizationMode): string {
  return MODE_UNITS[mode]
}

function positiveAscending(values: readonly number[]): number[] {
  return values
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((left, right) => left - right)
}

function roundBreak(value: number): number {
  return value >= 10 ? Math.round(value) : Number(value.toPrecision(3))
}

function quantile(sorted: readonly number[], fraction: number): number {
  const position = (sorted.length - 1) * fraction
  const lower = Math.floor(position)
  const upper = Math.ceil(position)

  return lower === upper
    ? sorted[lower]
    : sorted[lower] + (position - lower) * (sorted[upper] - sorted[lower])
}
function quantileBreaks(
  sorted: readonly number[],
  classCount: number,
): number[] {
  return Array.from({ length: classCount - 1 }, (_entry, index) =>
    roundBreak(quantile(sorted, (index + 1) / classCount)),
  )
}
function logarithmicBreaks(
  sorted: readonly number[],
  classCount: number,
): number[] {
  const minimum = sorted[0]
  const maximum = sorted[sorted.length - 1]
  const lower = Math.log(minimum)
  const step = (Math.log(maximum) - lower) / classCount

  return Array.from({ length: classCount - 1 }, (_entry, index) =>
    roundBreak(Math.exp(lower + step * (index + 1))),
  )
}

function uniqueAscending(breaks: readonly number[]): number[] {
  return [...new Set(breaks)].sort((left, right) => left - right)
}

export function buildChoroplethScale(
  mode: MapVisualizationMode,
  values: readonly number[],
): ChoroplethScale | null {
  if (isCategoricalVisualization(mode)) return null

  const sorted = positiveAscending(values)
  if (sorted.length === 0) return null

  const classCount = Math.min(MAX_CHOROPLETH_CLASSES, sorted.length)
  const rawBreaks =
    mode === 'log'
      ? logarithmicBreaks(sorted, classCount)
      : quantileBreaks(sorted, classCount)
  const breaks = uniqueAscending(rawBreaks).filter(
    (value) => value > sorted[0] && value <= sorted[sorted.length - 1],
  )

  return {
    valueKey: visualizationValueKey(mode),
    breaks,
    colors: SEQUENTIAL_COLORS.slice(0, breaks.length + 1),
  }
}

export function buildChoroplethLegend(
  mode: MapVisualizationMode,
  scale: ChoroplethScale | null,
  values: readonly number[],
): ChoroplethLegend {
  const classified = positiveAscending(values)

  if (scale === null) {
    return {
      mode,
      unit: visualizationUnit(mode),
      classes: [],
      classifiedFeatureCount: classified.length,
    }
  }

  const lowerBounds = [classified[0], ...scale.breaks] as readonly number[]

  return {
    mode,
    unit: visualizationUnit(mode),
    classes: scale.colors.map((color, index) => ({
      color,
      from: lowerBounds[index],
      to: scale.breaks[index] ?? null,
    })),
    classifiedFeatureCount: classified.length,
  }
}
