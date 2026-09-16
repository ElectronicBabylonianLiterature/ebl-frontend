import { useCallback, useEffect } from 'react'
import type { MapExperience } from './useMapExperience'
import type { MapPanelController } from './useMapPanel'
import type { HistoricalMapPanel } from './useHistoricalMapPanel'
import type { MapHoverPreview, MapSelection } from './mapSelection'

export interface MapSelectionActions {
  readonly selectFeature: (selection: MapSelection) => void
  readonly deselectFeature: () => void
  readonly dismissSelection: () => void
  readonly browseHistoricalMaps: (siteName: string) => void
}

/**
 * Selecting a feature opens the inspector. Two different actions clear it
 * again: the inspector's own "Back to explore" (`deselectFeature`) returns to
 * the explorer view within the same open panel, while the header's "Clear
 * selection" and the second stage of Escape (`dismissSelection`) also close
 * the inspector if it is what is open. Escape itself is two-stage: it closes
 * whatever panel is open first, and only clears the selection on a second
 * press once no panel remains. While presentation mode owns Escape, the
 * shortcut is suspended so leaving the mode never also drops the selection
 * the presenter is standing on.
 */
export default function useMapSelectionActions(
  experience: MapExperience,
  mapPanel: MapPanelController,
  historicalMapPanel: HistoricalMapPanel,
  setHoverPreview: (preview: MapHoverPreview | null) => void,
  isSuspended = false,
): MapSelectionActions {
  const { setSelection, selection } = experience
  const { active: activePanel, open: openPanel, close: closePanel } = mapPanel

  const selectFeature = useCallback(
    (nextSelection: MapSelection) => {
      setSelection(nextSelection)
      openPanel('inspector')
    },
    [setSelection, openPanel],
  )

  const deselectFeature = useCallback(() => {
    setSelection(null)
    setHoverPreview(null)
  }, [setSelection, setHoverPreview])

  const dismissSelection = useCallback(() => {
    deselectFeature()
    if (activePanel === 'inspector') closePanel()
  }, [deselectFeature, activePanel, closePanel])

  const browseHistoricalMaps = useCallback(
    (siteName: string) => {
      historicalMapPanel.browseSite(siteName)
      openPanel('layers')
    },
    [historicalMapPanel, openPanel],
  )

  useEffect(() => {
    if (isSuspended) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return

      if (activePanel !== null) {
        closePanel()
      } else if (selection !== null) {
        setSelection(null)
        setHoverPreview(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    activePanel,
    closePanel,
    selection,
    setSelection,
    setHoverPreview,
    isSuspended,
  ])

  return {
    selectFeature,
    deselectFeature,
    dismissSelection,
    browseHistoricalMaps,
  }
}
