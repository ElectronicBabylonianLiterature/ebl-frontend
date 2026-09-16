import { useMemo } from 'react'
import type { MapExperience } from './useMapExperience'
import type { MapCameraState, MapUrlStateContext } from './mapUrlState'
import useMapUrlSync from './useMapUrlState'

/**
 * Assembles the serializable half of the map's state and hands it to the URL
 * sync. Presentation mode is deliberately absent: it is a view-only layout
 * switch, so a shared link never puts its recipient into a mode they did not
 * ask for.
 */
export default function useMapUrlPersistence(
  camera: MapCameraState,
  experience: MapExperience,
  context: MapUrlStateContext,
): void {
  useMapUrlSync(
    useMemo(
      () => ({
        camera,
        layers: experience.layers,
        overlays: experience.activeOverlays,
        selection: experience.selection,
        siteFilter: experience.siteFilter,
        visualization: experience.visualization,
        tools: {
          terrain: experience.tools.terrain,
          comparison: experience.tools.comparison,
          timeline: experience.tools.timeline,
          threeD: experience.tools.threeD,
        },
      }),
      [camera, experience],
    ),
    context,
    experience.restore,
  )
}
