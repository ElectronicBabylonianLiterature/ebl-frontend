import { useMemo } from 'react'
import type {
  ActiveHistoricalOverlay,
  HistoricalMapOverlay,
} from './historicalOverlays'
import { comparisonOverlays } from './mapComparison'
import type { ComparisonState } from './mapComparison'
import { toDatedOverlays } from './overlayPublicationDates'
import {
  type PublicationTimelineState,
  filterByPublicationTimeline,
} from './overlayTimelineFilter'

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
      active:
        compared.length > 0
          ? compared
          : selected.filter((overlay) => availableIds.has(overlay.id)),
    }
  }, [overlays, selected, timeline, comparison])
}
