import { evaluatePaint } from 'test-support/mapExpressionEvaluator'
import {
  createExcavationAreaFillLayer,
  createExcavationAreaOutlineLayer,
  createExcavationAreasSource,
  excavationAreaFillLayer,
  excavationAreaOutlineLayer,
  excavationAreaSelectedLayer,
} from './mapExcavationLayers'
import {
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
  EXCAVATION_AREA_SELECTED_LAYER_ID,
  EXCAVATION_AREAS_SOURCE_ID,
} from './mapLayerIds'
import { EXCAVATION_POLYGON_GEOJSON_URL } from './excavationPolygonIndex'
import { COLOR_SELECTED, SEQUENTIAL_COLORS } from './mapPaintExpressions'

function paintOf(layer: unknown): Record<string, unknown> {
  return (layer as { paint: Record<string, unknown> }).paint
}

describe('excavation source', () => {
  it('promotes the canonical polygon id so feature state can key on it', () => {
    expect(createExcavationAreasSource()).toEqual({
      type: 'geojson',
      data: EXCAVATION_POLYGON_GEOJSON_URL,
      promoteId: 'id',
    })
  })
})

describe('layer identity', () => {
  it('binds every excavation layer to the excavation source', () => {
    for (const layer of [
      excavationAreaFillLayer,
      excavationAreaOutlineLayer,
      excavationAreaSelectedLayer,
    ]) {
      expect((layer as { source: string }).source).toBe(
        EXCAVATION_AREAS_SOURCE_ID,
      )
    }
  })

  it('uses the shared layer ids', () => {
    expect(excavationAreaFillLayer.id).toBe(EXCAVATION_AREA_FILL_LAYER_ID)
    expect(excavationAreaOutlineLayer.id).toBe(EXCAVATION_AREA_OUTLINE_LAYER_ID)
    expect(excavationAreaSelectedLayer.id).toBe(
      EXCAVATION_AREA_SELECTED_LAYER_ID,
    )
  })

  it('starts visible so the visibility helper controls display', () => {
    expect(
      (excavationAreaFillLayer as { layout: Record<string, unknown> }).layout
        .visibility,
    ).toBe('visible')
  })
})

describe('default (categorical) layers', () => {
  it('paints mapped-with-fragments distinctly from unmapped', () => {
    const paint = paintOf(excavationAreaFillLayer)

    expect(
      evaluatePaint(paint, 'fill-color', {
        featureState: { findspotCount: 2, accessibleFragmentCount: 4 },
      }),
    ).toBe('#b36b24')
    expect(
      evaluatePaint(paint, 'fill-color', {
        featureState: { findspotCount: 0, accessibleFragmentCount: 0 },
      }),
    ).toBe('#7b7f73')
  })
})

describe('choropleth-configured layers', () => {
  const paint = {
    kind: 'choropleth' as const,
    scale: {
      valueKey: 'accessibleFragmentCount' as const,
      breaks: [2, 5],
      colors: SEQUENTIAL_COLORS.slice(0, 3),
    },
  }

  it('applies the supplied scale to the fill layer', () => {
    expect(
      evaluatePaint(
        paintOf(createExcavationAreaFillLayer(paint)),
        'fill-color',
        { featureState: { findspotCount: 1, accessibleFragmentCount: 6 } },
      ),
    ).toBe(SEQUENTIAL_COLORS[2])
  })

  it('applies the supplied scale to the outline width', () => {
    expect(
      evaluatePaint(
        paintOf(createExcavationAreaOutlineLayer(paint)),
        'line-width',
        { featureState: { findspotCount: 1, accessibleFragmentCount: 6 } },
      ),
    ).toBeCloseTo(2.6)
  })

  it('still gives selection precedence under a scale', () => {
    expect(
      evaluatePaint(
        paintOf(createExcavationAreaFillLayer(paint)),
        'fill-color',
        {
          featureState: {
            findspotCount: 1,
            accessibleFragmentCount: 6,
            selected: true,
          },
        },
      ),
    ).toBe(COLOR_SELECTED)
  })
})

describe('selected halo layer', () => {
  it('is invisible until a feature is selected', () => {
    const paint = paintOf(excavationAreaSelectedLayer)

    expect(
      evaluatePaint(paint, 'line-width', { featureState: { selected: false } }),
    ).toBe(0)
    expect(
      evaluatePaint(paint, 'line-opacity', {
        featureState: { selected: false },
      }),
    ).toBe(0)
  })

  it('draws a white halo around the selected feature', () => {
    const paint = paintOf(excavationAreaSelectedLayer)

    expect(paint['line-color']).toBe('#ffffff')
    expect(
      evaluatePaint(paint, 'line-width', { featureState: { selected: true } }),
    ).toBe(7)
    expect(
      evaluatePaint(paint, 'line-opacity', {
        featureState: { selected: true },
      }),
    ).toBe(0.9)
  })
})
