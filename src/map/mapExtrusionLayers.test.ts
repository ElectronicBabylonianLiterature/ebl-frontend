import type { AddLayerObject } from 'maplibre-gl'
import {
  EXCAVATION_EXTRUSION_LAYER_ID,
  EXTRUSION_OPACITY,
  createExcavationExtrusionLayer,
  pitchForExtrusion,
} from 'map/mapExtrusionLayers'

type FillExtrusionLayer = Extract<AddLayerObject, { type: 'fill-extrusion' }>
import { CATEGORICAL_PAINT } from 'map/mapExcavationPaint'

describe('createExcavationExtrusionLayer', () => {
  it('is a hidden fill-extrusion on the canonical excavation source', () => {
    const layer = createExcavationExtrusionLayer(
      CATEGORICAL_PAINT,
      null,
    ) as FillExtrusionLayer
    expect(layer.id).toBe(EXCAVATION_EXTRUSION_LAYER_ID)
    expect(layer.type).toBe('fill-extrusion')
    expect(layer.layout).toEqual({ visibility: 'none' })
    expect(layer.paint?.['fill-extrusion-opacity']).toBe(EXTRUSION_OPACITY)
  })

  it('can be created already visible', () => {
    expect(
      (createExcavationExtrusionLayer(
        CATEGORICAL_PAINT,
        null,
        true,
      ) as FillExtrusionLayer).layout,
    ).toEqual({ visibility: 'visible' })
  })
})

describe('pitchForExtrusion', () => {
  it('lifts a flat camera', () => {
    const easeTo = jest.fn()
    pitchForExtrusion({ getPitch: () => 0, easeTo }, false)
    expect(easeTo).toHaveBeenCalled()
  })

  it('leaves an already-pitched camera alone', () => {
    const easeTo = jest.fn()
    pitchForExtrusion({ getPitch: () => 45, easeTo }, false)
    expect(easeTo).not.toHaveBeenCalled()
  })
})
