import { historicalMapOverlay } from 'test-support/map-fixtures'
import { toDatedOverlays } from './overlayPublicationDates'
import {
  DEFAULT_TIMELINE_STATE,
  type PublicationTimelineState,
  filterByPublicationTimeline,
  isTimelineActive,
  timelineSummary,
} from './overlayTimelineFilter'

const DATED = toDatedOverlays([
  historicalMapOverlay({ id: 'a', dateLabel: '1938' }),
  historicalMapOverlay({ id: 'b', dateLabel: '1954-1960' }),
  historicalMapOverlay({ id: 'c', dateLabel: '2017' }),
  historicalMapOverlay({ id: 'd', dateLabel: '2323' }),
  historicalMapOverlay({ id: 'e', dateLabel: undefined }),
])

function ids(state: PublicationTimelineState): readonly string[] {
  return filterByPublicationTimeline(DATED, state).map(
    (entry) => entry.overlay.id,
  )
}

describe('isTimelineActive', () => {
  it.each([
    [DEFAULT_TIMELINE_STATE, false],
    [{ ...DEFAULT_TIMELINE_STATE, startYear: 1950 }, true],
    [{ ...DEFAULT_TIMELINE_STATE, endYear: 1950 }, true],
    [{ ...DEFAULT_TIMELINE_STATE, includeUndated: false }, true],
  ])('reports %o as %s', (state, expected) => {
    expect(isTimelineActive(state)).toBe(expected)
  })
})

describe('filterByPublicationTimeline', () => {
  it('keeps everything by default', () => {
    expect(ids(DEFAULT_TIMELINE_STATE)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('excludes undated and unestablished maps on request', () => {
    expect(ids({ ...DEFAULT_TIMELINE_STATE, includeUndated: false })).toEqual([
      'a',
      'b',
      'c',
    ])
  })

  it('applies a lower bound against the end of a range', () => {
    expect(
      ids({ startYear: 1955, endYear: null, includeUndated: false }),
    ).toEqual(['b', 'c'])
  })

  it('applies an upper bound against the start of a range', () => {
    expect(
      ids({ startYear: null, endYear: 1954, includeUndated: false }),
    ).toEqual(['a', 'b'])
  })

  it('applies both bounds together', () => {
    expect(
      ids({ startYear: 1939, endYear: 1955, includeUndated: false }),
    ).toEqual(['b'])
  })

  it('can exclude every dated map while keeping the undated ones', () => {
    expect(
      ids({ startYear: 1900, endYear: 1901, includeUndated: true }),
    ).toEqual(['d', 'e'])
  })
})

describe('timelineSummary', () => {
  it('counts what is shown and what has no established date', () => {
    expect(timelineSummary(DATED, DEFAULT_TIMELINE_STATE)).toBe(
      '5 of 5 historical maps shown; 2 without an established publication date.',
    )
  })

  it('reflects an active filter', () => {
    expect(
      timelineSummary(DATED, {
        startYear: 1939,
        endYear: 1955,
        includeUndated: false,
      }),
    ).toBe(
      '1 of 5 historical maps shown; 2 without an established publication date.',
    )
  })
})
