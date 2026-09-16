import { renderHook } from '@testing-library/react'
import { DEFAULT_MAP_TOOL_URL_STATE } from './mapToolUrlState'
import type { MapTools } from './useMapTools'
import type { MapTerrainResult } from './useMapTerrain'
import type { MapToolInteractions } from './useMapToolInteractions'
import { EMPTY_SPATIAL_SEARCH_RESULT } from './spatialSearch'
import { type ToolPanelsInput, useToolPanelDefinitions } from './mapToolPanels'

const tools: MapTools = {
  ...DEFAULT_MAP_TOOL_URL_STATE,
  setTerrain: jest.fn(),
  setComparisonMode: jest.fn(),
  setComparisonSide: jest.fn(),
  setBlendPosition: jest.fn(),
  toggleSolo: jest.fn(),
  setTimeline: jest.fn(),
  setDimensionMode: jest.fn(),
  setExtrusionMetric: jest.fn(),
  setExtrusionScale: jest.fn(),
  setTerrainExaggeration: jest.fn(),
  setHillshadeVisible: jest.fn(),
  restoreTools: jest.fn(),
  resetTools: jest.fn(),
}

const interactions: MapToolInteractions = {
  measurementPositions: [],
  measurementMode: 'distance',
  measurementUnits: 'metric',
  setMeasurementMode: jest.fn(),
  setMeasurementUnits: jest.fn(),
  clearMeasurement: jest.fn(),
  searchShape: null,
  searchResult: EMPTY_SPATIAL_SEARCH_RESULT,
  isDrawing: false,
  startDrawing: jest.fn(),
  searchViewport: jest.fn(),
  clearSearch: jest.fn(),
  addPosition: jest.fn(),
}

function threeDProps(terrain: MapTerrainResult): ToolPanelsInput['threeD'] {
  return {
    mode: '2d',
    metric: 'accessible-fragments',
    extrusionScale: 1,
    terrainExaggeration: 1.4,
    hillshadeVisible: true,
    scale: null,
    terrain,
    tour: {
      steps: [],
      isRunning: false,
      index: 0,
      canStart: false,
      start: jest.fn(),
      next: jest.fn(),
      previous: jest.fn(),
      exit: jest.fn(),
    },
    hasExtrusionData: false,
    isDensityAvailable: false,
    onModeChange: jest.fn(),
    onMetricChange: jest.fn(),
    onExtrusionScaleChange: jest.fn(),
    onTerrainExaggerationChange: jest.fn(),
    onHillshadeChange: jest.fn(),
  }
}

function baseInput(terrain: MapTerrainResult): ToolPanelsInput {
  return {
    tools,
    terrain,
    elevation: { status: 'empty', profile: null, sampleCount: 0 },
    threeD: threeDProps(terrain),
    overlays: [],
    activeOverlays: [],
    excavationPolygonIndex: new Map(),
    polygonSummaries: new Map(),
    visualization: 'mapped',
    siteFilter: '',
    interactions,
  }
}

function terrainDefinition(
  definitions: ReturnType<typeof useToolPanelDefinitions>,
) {
  return definitions.find((entry) => entry.id === 'terrain')
}

describe('useToolPanelDefinitions', () => {
  it('supports terrain when the capability reports supported', () => {
    const { result } = renderHook(() =>
      useToolPanelDefinitions(
        baseInput({
          isSupported: true,
          source: null,
          exaggeration: 1,
          unavailableReason: null,
          isEnabled: false,
        }),
      ),
    )

    expect(terrainDefinition(result.current)?.isSupported).toBe(true)
  })

  it('still offers terrain when unsupported here but a source is approved', () => {
    const { result } = renderHook(() =>
      useToolPanelDefinitions(
        baseInput({
          isSupported: false,
          source: {
            id: 'aws-terrain-tiles-terrarium',
            label: 'Modern elevation model',
            tiles: [],
            encoding: 'terrarium',
            tileSize: 256,
            minZoom: 0,
            maxZoom: 15,
            attribution: '',
            licenceUrl: 'https://example.test',
            registryUrl: 'https://example.test',
            verifiedOn: '2026-01-01',
          },
          exaggeration: 1,
          unavailableReason: 'low-power-device',
          isEnabled: false,
        }),
      ),
    )

    expect(terrainDefinition(result.current)?.isSupported).toBe(true)
  })

  it('hides terrain when no source is approved at all', () => {
    const { result } = renderHook(() =>
      useToolPanelDefinitions(
        baseInput({
          isSupported: false,
          source: null,
          exaggeration: 1,
          unavailableReason: 'no-approved-source',
          isEnabled: false,
        }),
      ),
    )

    expect(terrainDefinition(result.current)?.isSupported).toBe(false)
  })
})
