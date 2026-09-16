import { evaluatePaint } from 'test-support/mapExpressionEvaluator'
import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { resetMapLibreMock } from '__mocks__/maplibre-gl'
import { aggregateFindspotMapData } from './findspotMapData'
import { buildVisualizationValues } from './mapVisualizationValues'
import { buildExtrusionScale } from './mapExtrusionScale'
import { CATEGORICAL_PAINT, EVIDENCE_PAINT } from './mapExcavationPaint'
import { COLOR_EVIDENCE_CURATED, EVIDENCE_CODES } from './mapEvidencePaint'
import { COLOR_MAPPED_FRAGMENTS } from './mapPaintColors'
import {
  EXCAVATION_EXTRUSION_LAYER_ID,
  EXTRUSION_PITCH,
  applyExtrusionPaint,
  createExcavationExtrusionLayer,
  pitchForExtrusion,
  setExtrusionVisibility,
} from './mapExtrusionLayers'
import {
  EXCAVATION_AREA_SELECTED_LAYER_ID,
  EXCAVATION_AREAS_SOURCE_ID,
} from './mapLayerIds'
import { initializeFindspotSources } from './mapSourceLifecycle'
import { excavationPolygon, findspotMapData } from 'test-support/map-fixtures'

const values = buildVisualizationValues(
  aggregateFindspotMapData([
    findspotMapData({ polygonIds: ['a'], accessibleFragmentCount: 9 }),
  ]),
  new Map([['assur', [excavationPolygon({ polygonId: 'a' })]]]),
)
const scale = buildExtrusionScale('accessible-fragments', values)

function paintOf(layer: unknown): Record<string, unknown> {
  return (layer as { paint: Record<string, unknown> }).paint
}

beforeEach(() => {
  resetMapLibreMock()
})

describe('layer definition', () => {
  const layer = createExcavationExtrusionLayer(CATEGORICAL_PAINT, scale)

  it('reuses the canonical polygon source rather than copying geometry', () => {
    expect((layer as { source: string }).source).toBe(
      EXCAVATION_AREAS_SOURCE_ID,
    )
    expect(layer.id).toBe(EXCAVATION_EXTRUSION_LAYER_ID)
    expect(layer.type).toBe('fill-extrusion')
  })

  it('starts hidden so 2D stays the default', () => {
    expect(
      (layer as { layout: Record<string, unknown> }).layout.visibility,
    ).toBe('none')
  })

  it('takes its colour from the active analytical palette', () => {
    expect(
      evaluatePaint(paintOf(layer), 'fill-extrusion-color', {
        featureState: { findspotCount: 2, accessibleFragmentCount: 4 },
      }),
    ).toBe(COLOR_MAPPED_FRAGMENTS)
  })

  it('follows the evidence palette when evidence mode is active', () => {
    expect(
      evaluatePaint(
        paintOf(createExcavationExtrusionLayer(EVIDENCE_PAINT, scale)),
        'fill-extrusion-color',
        { featureState: { evidenceCode: EVIDENCE_CODES.curated } },
      ),
    ).toBe(COLOR_EVIDENCE_CURATED)
  })
})

describe('layer order', () => {
  it('sits below the selection halo and below the site markers', () => {
    const map = createMapMock()

    initializeFindspotSources(asLibreMap(map), [], false, true)

    const ids = [...map.layers.keys()]
    expect(ids.indexOf(EXCAVATION_EXTRUSION_LAYER_ID)).toBeLessThan(
      ids.indexOf(EXCAVATION_AREA_SELECTED_LAYER_ID),
    )
    expect(ids.indexOf(EXCAVATION_EXTRUSION_LAYER_ID)).toBeLessThan(
      ids.indexOf('ebl-unclustered-points'),
    )
  })
})

describe('applyExtrusionPaint', () => {
  it('repaints in place without recreating the source', () => {
    const map = createMapMock()
    initializeFindspotSources(asLibreMap(map), [], false, true)
    const sourcesBefore = [...map.sources.keys()]

    applyExtrusionPaint(asLibreMap(map), EVIDENCE_PAINT, scale)

    expect([...map.sources.keys()]).toEqual(sourcesBefore)
    expect(map.setPaintProperty).toHaveBeenCalledWith(
      EXCAVATION_EXTRUSION_LAYER_ID,
      'fill-extrusion-height',
      expect.anything(),
    )
  })

  it('does nothing when the layer is absent', () => {
    const map = createMapMock()

    applyExtrusionPaint(asLibreMap(map), CATEGORICAL_PAINT, scale)
    setExtrusionVisibility(asLibreMap(map), true)

    expect(map.setPaintProperty).not.toHaveBeenCalled()
    expect(map.setLayoutProperty).not.toHaveBeenCalled()
  })
})

describe('setExtrusionVisibility', () => {
  it('toggles only the extrusion layer', () => {
    const map = createMapMock()
    initializeFindspotSources(asLibreMap(map), [], false, true)

    setExtrusionVisibility(asLibreMap(map), true)

    expect(map.setLayoutProperty).toHaveBeenCalledWith(
      EXCAVATION_EXTRUSION_LAYER_ID,
      'visibility',
      'visible',
    )
  })
})

describe('pitchForExtrusion', () => {
  it('lifts a flat view', () => {
    const easeTo = jest.fn()

    pitchForExtrusion({ getPitch: () => 0, easeTo }, false)

    expect(easeTo).toHaveBeenCalledWith({
      pitch: EXTRUSION_PITCH,
      duration: 600,
    })
  })

  it('jumps instead of animating under reduced motion', () => {
    const easeTo = jest.fn()

    pitchForExtrusion({ getPitch: () => 0, easeTo }, true)

    expect(easeTo).toHaveBeenCalledWith({
      pitch: EXTRUSION_PITCH,
      duration: 0,
    })
  })

  it('leaves an already-pitched camera alone', () => {
    const easeTo = jest.fn()

    pitchForExtrusion({ getPitch: () => 45, easeTo }, false)

    expect(easeTo).not.toHaveBeenCalled()
  })
})
