import type { BoundingBox } from './mapGeometry'

export interface TourStep {
  readonly id: string
  readonly label: string
  readonly bounds: BoundingBox
  readonly pitch: number
  readonly maxZoom: number
}

export interface TourInput {
  readonly siteName: string
  readonly siteBounds: BoundingBox | null
  readonly excavationBounds: BoundingBox | null
  readonly selectedPolygonBounds: BoundingBox | null
  readonly activeOverlayBounds: BoundingBox | null
  readonly isTerrainEnabled: boolean
}

/**
 * Every keyframe is derived from bounds the map already holds — site geometry,
 * linked excavation polygons, the selected polygon, the active overlay. No
 * coordinate is written here, so the tour works for any site that has bounds,
 * and a site missing a feature simply loses that step rather than failing.
 */
export function buildTourSteps(input: TourInput): readonly TourStep[] {
  const overview = input.siteBounds ?? input.excavationBounds
  if (overview === null) return []

  return [
    {
      id: 'overview',
      label: `${input.siteName} overview`,
      bounds: overview,
      pitch: 0,
      maxZoom: 12,
    },
    ...(input.isTerrainEnabled
      ? [
          {
            id: 'terrain',
            label: 'Modern terrain',
            bounds: overview,
            pitch: 55,
            maxZoom: 13,
          },
        ]
      : []),
    ...(input.excavationBounds === null
      ? []
      : [
          {
            id: 'excavation-areas',
            label: 'Linked excavation areas',
            bounds: input.excavationBounds,
            pitch: 50,
            maxZoom: 15,
          },
        ]),
    ...(input.selectedPolygonBounds === null
      ? []
      : [
          {
            id: 'selected-area',
            label: 'Selected excavation area',
            bounds: input.selectedPolygonBounds,
            pitch: 55,
            maxZoom: 17,
          },
        ]),
    ...(input.activeOverlayBounds === null
      ? []
      : [
          {
            id: 'historical-map',
            label: 'Active historical map',
            bounds: input.activeOverlayBounds,
            pitch: 40,
            maxZoom: 16,
          },
        ]),
    {
      id: 'inspect',
      label: 'Ready to inspect',
      bounds: input.selectedPolygonBounds ?? input.excavationBounds ?? overview,
      pitch: 45,
      maxZoom: 16,
    },
  ]
}

export function tourProgressLabel(
  index: number,
  total: number,
  step: TourStep | undefined,
): string {
  return step === undefined
    ? 'Tour unavailable'
    : `Step ${index + 1} of ${total}: ${step.label}`
}
