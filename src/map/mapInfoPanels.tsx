import React from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type {
  ChoroplethLegend,
  MapVisualizationMode,
} from './mapChoroplethScale'
import type { ActiveOverlayEntry } from './historicalOverlayActions'
import type { MapExperience } from './useMapExperience'
import type { HistoricalMapPanel } from './useHistoricalMapPanel'
import MapInspector, { type MapInspectorProps } from './MapInspector'
import MapLayerControls from './MapLayerControls'
import MapVisualizationControl from './MapVisualizationControl'
import type { MapPanelDefinition } from './MapToolbar'

export interface InfoPanelsInput {
  readonly inspector: MapInspectorProps
  readonly experience: MapExperience
  readonly historicalMapPanel: HistoricalMapPanel
  readonly activeOverlayEntries: readonly ActiveOverlayEntry[]
  readonly linkedExcavationAreaCount: number
  readonly map: MapLibreMap | null
  readonly isDensityAvailable: boolean
  readonly legend: ChoroplethLegend
  readonly visualizationMode: MapVisualizationMode
  readonly onVisualizationModeChange: (mode: MapVisualizationMode) => void
}

/**
 * Explore/inspector, layers and visualization — the three panels that used
 * to render unconditionally (a permanent sidebar column and two always-open
 * floating boxes). They are ordinary panel definitions now, so opening one
 * closes whichever other panel — including each other — was open.
 */
export function buildInfoPanelDefinitions(
  input: InfoPanelsInput,
): readonly MapPanelDefinition[] {
  return [
    {
      id: 'inspector',
      label: input.inspector.selection === null ? 'Explore' : 'Selection',
      isSupported: true,
      render: () => <MapInspector {...input.inspector} />,
    },
    {
      id: 'layers',
      label: 'Layers',
      isSupported: true,
      render: () => (
        <MapLayerControls
          experience={input.experience}
          panel={input.historicalMapPanel}
          activeOverlayEntries={input.activeOverlayEntries}
          linkedExcavationAreaCount={input.linkedExcavationAreaCount}
          map={input.map}
        />
      ),
    },
    {
      id: 'visualization',
      label: 'Visualize',
      isSupported: true,
      render: () => (
        <MapVisualizationControl
          isDensityAvailable={input.isDensityAvailable}
          legend={input.legend}
          mode={input.visualizationMode}
          onModeChange={input.onVisualizationModeChange}
        />
      ),
    },
  ]
}
