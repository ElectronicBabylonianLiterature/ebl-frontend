import type { DatedOverlay } from './overlayPublicationDates'

export interface PublicationTimelineState {
  readonly startYear: number | null
  readonly endYear: number | null
  readonly includeUndated: boolean
}

export const DEFAULT_TIMELINE_STATE: PublicationTimelineState = {
  startYear: null,
  endYear: null,
  includeUndated: true,
}

export function isTimelineActive(state: PublicationTimelineState): boolean {
  return (
    state.startYear !== null || state.endYear !== null || !state.includeUndated
  )
}

function isWithinRange(
  dated: DatedOverlay,
  { startYear, endYear }: PublicationTimelineState,
): boolean {
  const { startYear: from, endYear: to } = dated.date
  if (from === null || to === null) return false

  return (
    (startYear === null || to >= startYear) &&
    (endYear === null || from <= endYear)
  )
}

/**
 * Overlays whose publication date could not be established — absent labels and
 * labels outside the plausible publication window — are governed by
 * `includeUndated`. They are never silently placed on the timeline.
 */
export function filterByPublicationTimeline(
  dated: readonly DatedOverlay[],
  state: PublicationTimelineState,
): readonly DatedOverlay[] {
  return dated.filter((entry) =>
    entry.date.startYear === null
      ? state.includeUndated
      : isWithinRange(entry, state),
  )
}

export function timelineSummary(
  dated: readonly DatedOverlay[],
  state: PublicationTimelineState,
): string {
  const visible = filterByPublicationTimeline(dated, state).length
  const undated = dated.filter((entry) => entry.date.startYear === null).length

  return `${visible} of ${dated.length} historical maps shown; ${undated} without an established publication date.`
}
