import { evaluatePaint } from 'test-support/mapExpressionEvaluator'
import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { resetMapLibreMock } from '__mocks__/maplibre-gl'
import {
  CATEGORICAL_PAINT,
  EVIDENCE_PAINT,
  type ExcavationPaint,
  excavationPaintProperties,
} from './mapExcavationPaint'
import { applyExcavationPaint } from './mapChoroplethLayers'
import {
  COLOR_MAPPED_FRAGMENTS,
  COLOR_UNMAPPED,
  SEQUENTIAL_COLORS,
} from './mapPaintColors'
import { COLOR_EVIDENCE_CURATED, EVIDENCE_CODES } from './mapEvidencePaint'
import {
  EXCAVATION_AREA_FILL_LAYER_ID,
  EXCAVATION_AREA_OUTLINE_LAYER_ID,
} from './mapLayerIds'

const choropleth: ExcavationPaint = {
  kind: 'choropleth',
  scale: {
    valueKey: 'accessibleFragmentCount',
    breaks: [2, 5],
    colors: SEQUENTIAL_COLORS.slice(0, 3),
  },
}

function paintRecord(paint: ExcavationPaint): Record<string, unknown> {
  const properties = excavationPaintProperties(paint)
  return {
    'fill-color': properties.fillColor,
    'line-color': properties.outlineColor,
  }
}

beforeEach(() => {
  resetMapLibreMock()
})

describe('excavationPaintProperties', () => {
  it('uses categorical expressions for the categorical mode', () => {
    expect(
      evaluatePaint(paintRecord(CATEGORICAL_PAINT), 'fill-color', {
        featureState: { findspotCount: 2, accessibleFragmentCount: 4 },
      }),
    ).toBe(COLOR_MAPPED_FRAGMENTS)
  })

  it('uses evidence expressions for the evidence mode', () => {
    expect(
      evaluatePaint(paintRecord(EVIDENCE_PAINT), 'fill-color', {
        featureState: { evidenceCode: EVIDENCE_CODES.curated },
      }),
    ).toBe(COLOR_EVIDENCE_CURATED)
  })

  it('uses the classed ramp for a choropleth scale', () => {
    expect(
      evaluatePaint(paintRecord(choropleth), 'fill-color', {
        featureState: { findspotCount: 1, accessibleFragmentCount: 6 },
      }),
    ).toBe(SEQUENTIAL_COLORS[2])
  })

  it('reports every property each mode needs', () => {
    expect(Object.keys(excavationPaintProperties(EVIDENCE_PAINT))).toEqual([
      'fillColor',
      'fillOpacity',
      'outlineColor',
      'outlineWidth',
      'outlineDash',
      'outlineOpacity',
    ])
  })
})

describe('applyExcavationPaint', () => {
  it('repaints both layers in place without touching sources', () => {
    const map = createMapMock()
    map.addLayer({ id: EXCAVATION_AREA_FILL_LAYER_ID, type: 'fill', paint: {} })
    map.addLayer({
      id: EXCAVATION_AREA_OUTLINE_LAYER_ID,
      type: 'line',
      paint: {},
    })

    applyExcavationPaint(asLibreMap(map), EVIDENCE_PAINT)

    expect(map.setPaintProperty).toHaveBeenCalledWith(
      EXCAVATION_AREA_FILL_LAYER_ID,
      'fill-color',
      expect.anything(),
    )
    expect(map.setPaintProperty).toHaveBeenCalledWith(
      EXCAVATION_AREA_OUTLINE_LAYER_ID,
      'line-dasharray',
      expect.anything(),
    )
    expect(map.sources.size).toBe(0)
  })

  it('does nothing when the layers are absent', () => {
    const map = createMapMock()

    applyExcavationPaint(asLibreMap(map), CATEGORICAL_PAINT)

    expect(map.setPaintProperty).not.toHaveBeenCalled()
  })

  it('leaves no stale outline colour behind on a mode switch', () => {
    const map = createMapMock()
    map.addLayer({
      id: EXCAVATION_AREA_OUTLINE_LAYER_ID,
      type: 'line',
      paint: {},
    })

    applyExcavationPaint(asLibreMap(map), EVIDENCE_PAINT)
    applyExcavationPaint(asLibreMap(map), CATEGORICAL_PAINT)

    const layer = map.getLayer(EXCAVATION_AREA_OUTLINE_LAYER_ID) as Record<
      string,
      unknown
    >
    expect(
      evaluatePaint(layer, 'line-color', {
        featureState: { findspotCount: 0 },
      }),
    ).toBe('#5f665c')
    expect(
      evaluatePaint(layer, 'line-color', {
        featureState: { evidenceCode: EVIDENCE_CODES.curated },
      }),
    ).not.toBe(COLOR_UNMAPPED)
  })
})
