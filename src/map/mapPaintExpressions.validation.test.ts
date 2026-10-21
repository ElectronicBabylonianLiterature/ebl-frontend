import {
  validateStyleMin,
  type FillLayerSpecification,
  type LineLayerSpecification,
} from '@maplibre/maplibre-gl-style-spec'
import {
  buildChoroplethScale,
  type MapVisualizationMode,
} from 'map/mapChoroplethScale'
import type { ExcavationPaint } from 'map/mapExcavationPaint'
import {
  createExcavationAreaFillLayer,
  createExcavationAreaOutlineLayer,
  EXCAVATION_AREAS_SOURCE_ID,
} from 'map/mapExcavationLayers'
import { SEQUENTIAL_COLORS } from 'map/mapPaintColors'
import { excavationFillColor } from 'map/mapPaintExpressions'
import { evaluateExpression } from 'test-support/mapExpressionEvaluator'

function validationErrors(paint: ExcavationPaint): readonly string[] {
  return validateStyleMin({
    version: 8,
    sources: {
      [EXCAVATION_AREAS_SOURCE_ID]: {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      },
    },
    layers: [
      createExcavationAreaFillLayer(paint) as FillLayerSpecification,
      createExcavationAreaOutlineLayer(paint) as LineLayerSpecification,
    ],
  }).map((error) => error.message)
}

describe('MapLibre validation of generated excavation paint', () => {
  it.each<MapVisualizationMode>(['count', 'log', 'density'])(
    'accepts %s scales for single, repeated, and varied positive values',
    (mode) => {
      for (const values of [[7], [5, 5, 5], [1, 2, 3, 4, 5]]) {
        const scale = buildChoroplethScale(mode, values)
        expect(scale).not.toBeNull()
        if (scale) {
          expect(validationErrors({ kind: 'choropleth', scale })).toEqual([])
        }
      }
    },
  )

  it('accepts the fallback density scale when all available densities are zero', () => {
    expect(
      validationErrors({
        kind: 'choropleth',
        scale: {
          valueKey: 'densityPerSquareKm',
          breaks: [],
          colors: [SEQUENTIAL_COLORS[0]],
        },
      }),
    ).toEqual([])
  })

  it('reuses the final color when a scale has more breaks than colors', () => {
    const scale = {
      valueKey: 'accessibleFragmentCount' as const,
      breaks: [2, 5],
      colors: [SEQUENTIAL_COLORS[0]],
    }

    expect(validationErrors({ kind: 'choropleth', scale })).toEqual([])
    expect(
      evaluateExpression(excavationFillColor(scale), {
        featureState: {
          dataAvailable: true,
          findspotCount: 1,
          accessibleFragmentCount: 7,
        },
      }),
    ).toBe(SEQUENTIAL_COLORS[0])
  })

  it.each<ExcavationPaint>([{ kind: 'categorical' }, { kind: 'evidence' }])(
    'accepts the $kind paint alongside numeric visualizations',
    (paint) => {
      expect(validationErrors(paint)).toEqual([])
    },
  )
})
