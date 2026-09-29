import { act, renderHook } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { ExcavationPolygon } from 'map/excavationPolygonIndex'
import { aggregateFindspotMapData } from 'map/findspotMapDataSanitizer'
import { EXCAVATION_AREA_FILL_LAYER_ID } from 'map/mapLayerIds'
import {
  deferMapLoad,
  markLayersAdded,
  mockGetBounds,
  mockMapInstance,
  mockOff,
  mockQueryRenderedFeatures,
  resetMapMocks,
  triggerMapEvent,
} from 'map/mapLibreMock.testSupport'
import type {
  FragmentMapDataState,
  FragmentMapDataStatus,
} from 'map/useFragmentMapData'
import useMapExportView from 'map/useMapExportView'
import {
  excavationPolygon,
  findspotMapDataDto,
} from 'test-support/map-fixtures'

jest.mock('maplibre-gl')

const FIRST = excavationPolygon({ polygonId: 'assur-a', name: 'Area A' })
const SECOND = excavationPolygon({ polygonId: 'assur-b', name: 'Area B' })
const POLYGONS = [FIRST, SECOND]
const mapRef: { current: MapLibreMap | null } = {
  current: mockMapInstance as unknown as MapLibreMap,
}

function fragmentData(
  status: FragmentMapDataStatus = 'loaded-with-mappings',
): FragmentMapDataState {
  const findspots =
    status === 'loaded-with-mappings'
      ? [findspotMapDataDto({ polygonIds: [FIRST.polygonId] })]
      : []
  const polygonSummaries = aggregateFindspotMapData(findspots)
  return {
    sites: new Map([
      [
        'assur',
        {
          status,
          findspots,
          polygonSummaries,
        },
      ],
    ]),
    findspots,
    polygonSummaries,
  }
}

function renderExportView({
  visible = true,
  selected = null,
  data = fragmentData(),
}: {
  visible?: boolean
  selected?: ExcavationPolygon | null
  data?: FragmentMapDataState
} = {}) {
  return renderHook(
    ({ isVisible, selection, mapData }) =>
      useMapExportView(mapRef, isVisible, POLYGONS, selection, mapData),
    {
      initialProps: {
        isVisible: visible,
        selection: selected,
        mapData: data,
      },
    },
  )
}

describe('useMapExportView', () => {
  beforeEach(() => {
    resetMapMocks()
    mapRef.current = mockMapInstance as unknown as MapLibreMap
  })

  it('exports only the selected canonical polygon even when the layer is hidden', () => {
    const { result } = renderExportView({
      visible: false,
      selected: SECOND,
    })

    expect(result.current.scope).toEqual({
      type: 'selection',
      polygonId: SECOND.polygonId,
    })
    expect(result.current.rows.map(({ polygonId }) => polygonId)).toEqual([
      SECOND.polygonId,
    ])
    expect(mockQueryRenderedFeatures).not.toHaveBeenCalled()
  })

  it('exports no viewport rows when the excavation layer is hidden', () => {
    markLayersAdded(EXCAVATION_AREA_FILL_LAYER_ID)
    mockQueryRenderedFeatures.mockReturnValue([{ id: FIRST.polygonId }])

    const { result } = renderExportView({ visible: false })

    expect(result.current.rows).toEqual([])
    expect(result.current.scope).toEqual({
      type: 'viewport',
      bounds: [[43, 35, 44, 36]],
    })
    expect(mockQueryRenderedFeatures).not.toHaveBeenCalled()
  })

  it('deduplicates rendered ids and ignores noncanonical or numeric ids', () => {
    markLayersAdded(EXCAVATION_AREA_FILL_LAYER_ID)
    mockQueryRenderedFeatures.mockReturnValue([
      { id: SECOND.polygonId },
      { id: FIRST.polygonId },
      { id: FIRST.polygonId },
      { id: 'unknown' },
      { id: 3 },
    ])

    const { result } = renderExportView()

    expect(mockQueryRenderedFeatures).toHaveBeenCalledWith(undefined, {
      layers: [EXCAVATION_AREA_FILL_LAYER_ID],
    })
    expect(result.current.rows.map(({ polygonId }) => polygonId)).toEqual([
      FIRST.polygonId,
      SECOND.polygonId,
    ])
  })

  it('refreshes viewport rows and bounds after map movement', () => {
    markLayersAdded(EXCAVATION_AREA_FILL_LAYER_ID)
    mockQueryRenderedFeatures.mockReturnValue([{ id: FIRST.polygonId }])
    const { result } = renderExportView()

    mockQueryRenderedFeatures.mockReturnValue([{ id: SECOND.polygonId }])
    mockGetBounds.mockReturnValue({
      getWest: () => 44,
      getSouth: () => 36,
      getEast: () => 45,
      getNorth: () => 37,
    })
    act(() => triggerMapEvent('moveend'))

    expect(result.current.rows[0].polygonId).toBe(SECOND.polygonId)
    expect(result.current.scope).toEqual({
      type: 'viewport',
      bounds: [[44, 36, 45, 37]],
    })
  })

  it('waits for a delayed style load before querying rendered polygons', () => {
    deferMapLoad()
    markLayersAdded(EXCAVATION_AREA_FILL_LAYER_ID)
    mockQueryRenderedFeatures.mockReturnValue([{ id: FIRST.polygonId }])
    const { result } = renderExportView()

    expect(result.current.rows).toEqual([])
    act(() => triggerMapEvent('load'))
    expect(result.current.rows[0].polygonId).toBe(FIRST.polygonId)
  })

  it('updates availability without converting failures into zero counts', () => {
    markLayersAdded(EXCAVATION_AREA_FILL_LAYER_ID)
    mockQueryRenderedFeatures.mockReturnValue([{ id: FIRST.polygonId }])
    const { result, rerender, unmount } = renderExportView()

    expect(result.current.rows[0].mappedFindspotCount).toBe(1)
    rerender({
      isVisible: true,
      selection: null,
      mapData: fragmentData('error'),
    })
    expect(result.current.rows[0]).toMatchObject({
      dataStatus: 'error',
      mappedFindspotCount: null,
    })

    mapRef.current = null
    expect(unmount).not.toThrow()
    expect(mockOff).toHaveBeenCalledWith('moveend', expect.any(Function))
    expect(mockOff).toHaveBeenCalledWith('idle', expect.any(Function))
    expect(mockOff).toHaveBeenCalledWith('load', expect.any(Function))
  })
})
