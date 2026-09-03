import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import MapInspector, { type MapInspectorProps } from 'map/MapInspector'
import { deriveMapSiteCapabilities } from 'map/mapSiteCapabilities'
import { findMapSite } from 'map/mapSites'
import { aggregateFindspotMapData } from 'map/findspotMapData'
import { derivePolygonResearchSummary } from 'map/mapResearchSummary'
import type { MapResearchContext } from 'map/mapResearchSummaryText'
import {
  excavationPolygon,
  findspotMapData,
  historicalMapOverlay,
  provenanceRecord,
} from './map-fixtures'

export const assurCapabilities = deriveMapSiteCapabilities(
  findMapSite('assur')!,
  {
    overlays: [historicalMapOverlay()],
    excavationPolygons: [excavationPolygon()],
    fragmentMapData: [findspotMapData()],
    fragmentDataStatus: 'loaded',
  },
)

export const kalhuCapabilities = deriveMapSiteCapabilities(
  findMapSite('kalhu')!,
  {
    overlays: [],
    excavationPolygons: [excavationPolygon({ siteId: 'kalhu' })],
  },
)

export const assurProvenance = provenanceRecord({
  id: 'assur',
  longName: 'Aššur',
})
export const kalhuProvenance = provenanceRecord({
  id: 'kalhu',
  longName: 'Kalḫu',
})

export const POLYGON_ID = 'assur-area-a-checksum'

export const polygonSummaries = aggregateFindspotMapData([
  findspotMapData({ polygonIds: [POLYGON_ID] }),
])

export function researchContext(): MapResearchContext {
  return {
    visualizationLabel: 'Mapping evidence',
    activeOverlayTitles: ['Andrae 1938, Beilage'],
    isTerrainEnabled: false,
    siteFilter: '',
    shareUrl: 'https://example.test/map?v=1',
    generatedAt: '2026-08-06T10:00:00.000Z',
  }
}

export function polygonSummary(
  polygonId = POLYGON_ID,
): ReturnType<typeof derivePolygonResearchSummary> {
  return derivePolygonResearchSummary({
    polygonId,
    polygon: excavationPolygon({ polygonId, name: 'bB6I' }),
    summary: polygonSummaries.get(polygonId),
    siteName: 'Aššur',
  })
}

export const assurSiteSummary = {
  siteId: 'assur',
  siteName: 'Aššur',
  totalPolygonCount: 134,
  linkedPolygonCount: 133,
  mappedFindspotCount: 317,
  accessibleFragmentCount: 1245,
  historicalOverlayCount: 10,
}

export function inspectorProps(
  overrides: Partial<MapInspectorProps> = {},
): MapInspectorProps {
  return {
    capabilities: [assurCapabilities, kalhuCapabilities],
    filteredProvenances: [assurProvenance, kalhuProvenance],
    mappedFindspotCount: 1,
    linkedExcavationAreaCount: 1,
    provenances: [assurProvenance, kalhuProvenance],
    selectedPolygonSite: undefined,
    selectedPolygonSummary: null,
    selectedSiteSummary: undefined,
    selection: null,
    showExcavationAreas: false,
    siteOverlays: [],
    activeOverlayIds: new Set<string>(),
    buildResearchContext: researchContext,
    onBrowseHistoricalMaps: jest.fn(),
    onClearSelection: jest.fn(),
    onCompareHistoricalMaps: jest.fn(),
    onSelectSite: jest.fn(),
    onShowExcavationAreas: jest.fn(),
    onToggleOverlay: jest.fn(),
    ...overrides,
  }
}

export function renderInspector(
  overrides: Partial<MapInspectorProps> = {},
): { props: MapInspectorProps } & RenderResult {
  const props = inspectorProps(overrides)
  return { props, ...render(<MapInspector {...props} />) }
}
