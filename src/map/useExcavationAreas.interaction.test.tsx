import React, { useRef } from 'react'
import { act, render } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { EXCAVATION_AREA_FILL_LAYER_ID } from 'map/mapLayerIds'
import {
  mockMapInstance,
  mockQueryRenderedFeatures,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'
import useExcavationAreas from 'map/useExcavationAreas'

jest.mock('maplibre-gl')

function Harness({
  isInteractionEnabled,
  onSelectPolygon,
}: {
  readonly isInteractionEnabled: boolean
  readonly onSelectPolygon: (polygonId: string) => void
}): null {
  const mapRef = useRef<MapLibreMap | null>(
    mockMapInstance as unknown as MapLibreMap,
  )
  useExcavationAreas(mapRef, {
    isVisible: true,
    selectedPolygonId: null,
    isInteractionEnabled,
    onSelectPolygon,
  })
  return null
}

describe('useExcavationAreas interaction ownership', () => {
  beforeEach(resetMapMocks)

  it('does not select an area while another map tool owns clicks', () => {
    const onSelectPolygon = jest.fn()
    mockQueryRenderedFeatures.mockReturnValue([{ id: 'area-1' }])
    render(
      <Harness
        isInteractionEnabled={false}
        onSelectPolygon={onSelectPolygon}
      />,
    )

    act(() => {
      triggerMapEvent(
        'click',
        { point: { x: 1, y: 2 } },
        EXCAVATION_AREA_FILL_LAYER_ID,
      )
    })

    expect(mockQueryRenderedFeatures).not.toHaveBeenCalled()
    expect(onSelectPolygon).not.toHaveBeenCalled()
  })
})
