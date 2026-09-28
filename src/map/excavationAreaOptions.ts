import type { ExcavationPaint } from 'map/mapExcavationPaint'
import type { PolygonVisualizationValues } from 'map/mapVisualizationValues'

export interface ExcavationAreaOptions {
  readonly isVisible: boolean
  readonly selectedPolygonId: string | null
  readonly paint?: ExcavationPaint
  readonly values?: PolygonVisualizationValues
  readonly onSelectPolygon: (polygonId: string) => void
  readonly onAvailabilityChange?: (isUnavailable: boolean) => void
  readonly isInteractionEnabled?: boolean
}
