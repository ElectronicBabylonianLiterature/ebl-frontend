import { useMemo } from 'react'
import type {
  ActiveHistoricalOverlay,
  HistoricalMapOverlay,
} from 'map/historicalOverlays'
import { comparisonOverlays, isComparisonReady } from 'map/mapComparison'
import type { ComparisonState } from 'map/mapComparison'
import { toDatedOverlays } from 'map/overlayPublicationDates'
import {
  type PublicationTimelineState,
  filterByPublicationTimeline,
} from 'map/overlayTimelineFilter'

export interface TimelineOverlays {
  /** Overlays offered in the catalogue after the publication-date filter. */
  readonly available: readonly HistoricalMapOverlay[]
  /** Overlays that should actually be drawn, honouring comparison mode. */
  readonly active: readonly ActiveHistoricalOverlay[]
}

/**
 * Comparison, when active, owns which overlays are drawn; otherwise the user's
 * own overlay selection applies, restricted to overlays the timeline still
 * admits.
 */
export default function useTimelineOverlays(
  overlays: readonly HistoricalMapOverlay[],
  selected: readonly ActiveHistoricalOverlay[],
  timeline: PublicationTimelineState,
  comparison: ComparisonState,
): TimelineOverlays {
  return useMemo(() => {
    const available = filterByPublicationTimeline(
      toDatedOverlays(overlays),
      timeline,
    ).map((entry) => entry.overlay)
    const availableIds = new Set(available.map((overlay) => overlay.id))
    const compared = comparisonOverlays(comparison)

    return {
      available,
      active: isComparisonReady(comparison)
        ? compared
        : selected.filter((overlay) => availableIds.has(overlay.id)),
    }
  }, [overlays, selected, timeline, comparison])
}
