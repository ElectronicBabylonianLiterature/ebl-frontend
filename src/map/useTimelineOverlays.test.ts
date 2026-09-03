import { renderHook } from '@testing-library/react'
import { historicalMapOverlay } from 'test-support/map-fixtures'
import { type ComparisonState, DEFAULT_COMPARISON_STATE } from './mapComparison'
import {
  DEFAULT_TIMELINE_STATE,
  type PublicationTimelineState,
} from './overlayTimelineFilter'
import useTimelineOverlays from './useTimelineOverlays'

const OVERLAYS = [
  historicalMapOverlay({ id: 'overlay-a', dateLabel: '1938' }),
  historicalMapOverlay({ id: 'overlay-b', dateLabel: '2017' }),
  historicalMapOverlay({ id: 'overlay-c', dateLabel: '2323' }),
]

const SELECTED = [
  { id: 'overlay-a', opacity: 0.7, visible: true },
  { id: 'overlay-c', opacity: 0.5, visible: true },
]

function render(
  timeline: PublicationTimelineState = DEFAULT_TIMELINE_STATE,
  comparison: ComparisonState = DEFAULT_COMPARISON_STATE,
) {
  return renderHook(() =>
    useTimelineOverlays(OVERLAYS, SELECTED, timeline, comparison),
  ).result.current
}

describe('useTimelineOverlays', () => {
  it('offers every overlay and draws the selection by default', () => {
    const { available, active } = render()

    expect(available.map((overlay) => overlay.id)).toEqual([
      'overlay-a',
      'overlay-b',
      'overlay-c',
    ])
    expect(active).toEqual(SELECTED)
  })

  it('stops drawing an overlay the timeline has excluded', () => {
    const { available, active } = render({
      startYear: null,
      endYear: null,
      includeUndated: false,
    })

    expect(available.map((overlay) => overlay.id)).toEqual([
      'overlay-a',
      'overlay-b',
    ])
    expect(active).toEqual([SELECTED[0]])
  })

  it('lets comparison take over which overlays are drawn', () => {
    const { active } = render(DEFAULT_TIMELINE_STATE, {
      ...DEFAULT_COMPARISON_STATE,
      mode: 'opacity',
      leftOverlayId: 'overlay-a',
      rightOverlayId: 'overlay-b',
      blendPosition: 0.25,
    })

    expect(active).toEqual([
      { id: 'overlay-a', opacity: 0.75, visible: true },
      { id: 'overlay-b', opacity: 0.25, visible: true },
    ])
  })

  it('falls back to the selection when comparison draws nothing', () => {
    expect(
      render(DEFAULT_TIMELINE_STATE, {
        ...DEFAULT_COMPARISON_STATE,
        mode: 'opacity',
        leftOverlayId: 'overlay-a',
        rightOverlayId: 'overlay-a',
      }).active,
    ).toEqual(SELECTED)
  })
})
