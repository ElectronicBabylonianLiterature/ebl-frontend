import React from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import MapControls from './MapControls'
import {
  type HistoricalMapOverlay,
  unionHistoricalOverlayBounds,
} from './historicalOverlays'
import {
  type ActiveOverlayEntry,
  unionMaxZoom,
} from './historicalOverlayActions'
import { fitMapToBoundingBox } from './mapCamera'
import type { MapExperience } from './useMapExperience'
import type { HistoricalMapPanel } from './useHistoricalMapPanel'

interface Props {
  readonly experience: MapExperience
  readonly panel: HistoricalMapPanel
  readonly activeOverlayEntries: readonly ActiveOverlayEntry[]
  readonly linkedExcavationAreaCount: number
  readonly map: MapLibreMap | null
}

export default function MapLayerControls({
  experience,
  panel,
  activeOverlayEntries,
  linkedExcavationAreaCount,
  map,
}: Props): JSX.Element {
  const fitToBounds = (
    bounds: readonly [number, number, number, number] | null,
    maxZoom?: number,
  ): void => {
    if (map) {
      fitMapToBoundingBox(map, bounds, {
        padding: 48,
        ...(maxZoom === undefined ? {} : { maxZoom }),
      })
    }
  }

  const setSeriesActive = (seriesId: string, isActive: boolean): void => {
    const series = panel.findSeries(seriesId)
    if (series) experience.setSeriesActive(series, isActive)
  }

  return (
    <MapControls
      activeOverlayEntries={activeOverlayEntries}
      activeOverlayIds={
        new Set(experience.activeOverlays.map((entry) => entry.id))
      }
      clearHistoricalOverlays={experience.clearOverlays}
      expandedSiteIds={panel.expandedSiteIds}
      hideSeries={(seriesId) => setSeriesActive(seriesId, false)}
      historicalMapFilter={panel.filter}
      historicalOverlayGroups={panel.groups}
      historicalOverlaySeries={panel.series}
      linkedExcavationAreaCount={linkedExcavationAreaCount}
      setExpandedSiteIds={panel.setExpandedSiteIds}
      setHistoricalMapFilter={panel.setFilter}
      setOverlayActive={experience.setOverlayActive}
      setOverlayOpacity={experience.setOverlayOpacity}
      setShowBoundaries={experience.setShowBoundaries}
      setShowExcavationAreas={experience.setShowExcavationAreas}
      showBoundaries={experience.showBoundaries}
      showExcavationAreas={experience.showExcavationAreas}
      showSeries={(seriesId) => setSeriesActive(seriesId, true)}
      zoomToActiveOverlays={() => {
        const overlays = activeOverlayEntries.map((entry) => entry.overlay)
        fitToBounds(
          unionHistoricalOverlayBounds(overlays),
          unionMaxZoom(overlays),
        )
      }}
      zoomToOverlay={(overlay: HistoricalMapOverlay) =>
        fitToBounds(overlay.bounds ?? null, overlay.maxZoom)
      }
      zoomToSeries={(seriesId) => {
        const series = panel.findSeries(seriesId)
        if (series) {
          fitToBounds(
            unionHistoricalOverlayBounds(series.overlays),
            unionMaxZoom(series.overlays),
          )
        }
      }}
    />
  )
}
