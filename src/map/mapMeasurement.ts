import type { Position } from 'geojson'
import { geodesicAreaSquareMetres } from './geodesicArea'
import { geodesicPathLengthMetres } from './geodesicDistance'

export type MeasurementMode = 'distance' | 'area'
export type MeasurementUnits = 'metric' | 'imperial'

export const MEASUREMENT_DISCLAIMER =
  'Temporary map measurement. Not an archaeological annotation and not stored with any record.'

const FEET_PER_METRE = 3.280839895013123
const SQUARE_FEET_PER_SQUARE_METRE = 10.763910416709722
const ACRES_PER_SQUARE_METRE = 0.0002471053814671653
const MINIMUM_AREA_VERTICES = 3

export interface Measurement {
  readonly mode: MeasurementMode
  readonly vertexCount: number
  readonly valueInBaseUnits: number | null
  readonly label: string
}

function formatNumber(value: number, decimals: number): string {
  return value.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function formatDistance(metres: number, units: MeasurementUnits): string {
  if (units === 'imperial') {
    const feet = metres * FEET_PER_METRE
    return feet < 5280
      ? `${formatNumber(feet, 0)} ft`
      : `${formatNumber(feet / 5280, 2)} mi`
  }

  return metres < 1000
    ? `${formatNumber(metres, 1)} m`
    : `${formatNumber(metres / 1000, 2)} km`
}

function formatArea(squareMetres: number, units: MeasurementUnits): string {
  if (units === 'imperial') {
    const squareFeet = squareMetres * SQUARE_FEET_PER_SQUARE_METRE
    return squareFeet < 43560
      ? `${formatNumber(squareFeet, 0)} sq ft`
      : `${formatNumber(squareMetres * ACRES_PER_SQUARE_METRE, 2)} acres`
  }

  return squareMetres < 1_000_000
    ? `${formatNumber(squareMetres, 0)} m²`
    : `${formatNumber(squareMetres / 1_000_000, 3)} km²`
}

function closedRing(positions: readonly Position[]): Position[] {
  const [first] = positions
  const last = positions[positions.length - 1]
  return first[0] === last[0] && first[1] === last[1]
    ? [...positions]
    : [...positions, first]
}

function measureArea(positions: readonly Position[]): number | null {
  return positions.length < MINIMUM_AREA_VERTICES
    ? null
    : geodesicAreaSquareMetres({
        type: 'Polygon',
        coordinates: [closedRing(positions)],
      })
}

export function measure(
  mode: MeasurementMode,
  positions: readonly Position[],
  units: MeasurementUnits,
): Measurement {
  const valueInBaseUnits =
    mode === 'distance'
      ? geodesicPathLengthMetres(positions)
      : measureArea(positions)

  return {
    mode,
    vertexCount: positions.length,
    valueInBaseUnits,
    label:
      valueInBaseUnits === null
        ? pendingLabel(mode, positions.length)
        : mode === 'distance'
          ? formatDistance(valueInBaseUnits, units)
          : formatArea(valueInBaseUnits, units),
  }
}

function pendingLabel(mode: MeasurementMode, vertexCount: number): string {
  const required = mode === 'distance' ? 2 : MINIMUM_AREA_VERTICES
  const outstanding = required - vertexCount

  if (vertexCount === 0) {
    return `Select points on the map to measure ${mode === 'distance' ? 'a distance' : 'an area'}.`
  }

  return outstanding > 0
    ? `Add ${outstanding} more point${outstanding === 1 ? '' : 's'}.`
    : 'These points do not enclose a measurable value.'
}
