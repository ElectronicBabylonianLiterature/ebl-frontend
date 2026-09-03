import {
  activeOverlayEntries,
  unionMaxZoom,
  withOverlayActive,
  withOverlayOpacity,
  withSeriesActive,
} from './historicalOverlayActions'
import { historicalMapOverlay } from 'test-support/map-fixtures'

const overlayA = historicalMapOverlay({ id: 'overlay-a', defaultOpacity: 0.7 })
const overlayB = historicalMapOverlay({
  id: 'overlay-b',
  defaultOpacity: 0.4,
  maxZoom: 16,
})
const overlayById = new Map([
  ['overlay-a', overlayA],
  ['overlay-b', overlayB],
])
const series = {
  seriesId: 'rn2747',
  seriesTitle: 'RN 2747',
  overlays: [overlayA, overlayB],
}

describe('activeOverlayEntries', () => {
  it('resolves active overlays against the catalog', () => {
    expect(
      activeOverlayEntries(
        [{ id: 'overlay-a', opacity: 0.5, visible: true }],
        overlayById,
      ),
    ).toEqual([{ overlay: overlayA, opacity: 0.5, visible: true }])
  })

  it('drops overlays that are not in the catalog', () => {
    expect(
      activeOverlayEntries(
        [{ id: 'removed', opacity: 1, visible: true }],
        overlayById,
      ),
    ).toEqual([])
  })
})

describe('withOverlayActive', () => {
  it('activates an overlay with its default opacity', () => {
    expect(withOverlayActive([], overlayA, true)).toEqual([
      { id: 'overlay-a', opacity: 0.7, visible: true },
    ])
  })

  it('deactivates an overlay', () => {
    expect(
      withOverlayActive(
        [{ id: 'overlay-a', opacity: 0.7, visible: true }],
        overlayA,
        false,
      ),
    ).toEqual([])
  })

  it('does not duplicate an already active overlay', () => {
    expect(
      withOverlayActive(
        [{ id: 'overlay-a', opacity: 0.2, visible: true }],
        overlayA,
        true,
      ),
    ).toEqual([{ id: 'overlay-a', opacity: 0.7, visible: true }])
  })
})

describe('withOverlayOpacity', () => {
  it('changes only the requested overlay', () => {
    expect(
      withOverlayOpacity(
        [
          { id: 'overlay-a', opacity: 0.7, visible: true },
          { id: 'overlay-b', opacity: 0.4, visible: true },
        ],
        'overlay-b',
        0.1,
      ),
    ).toEqual([
      { id: 'overlay-a', opacity: 0.7, visible: true },
      { id: 'overlay-b', opacity: 0.1, visible: true },
    ])
  })
})

describe('withSeriesActive', () => {
  it('activates every overlay in the series', () => {
    expect(withSeriesActive([], series, true)).toEqual([
      { id: 'overlay-a', opacity: 0.7, visible: true },
      { id: 'overlay-b', opacity: 0.4, visible: true },
    ])
  })

  it('removes every overlay in the series', () => {
    expect(
      withSeriesActive(
        [
          { id: 'overlay-a', opacity: 0.7, visible: true },
          { id: 'other', opacity: 1, visible: true },
        ],
        series,
        false,
      ),
    ).toEqual([{ id: 'other', opacity: 1, visible: true }])
  })
})

describe('unionMaxZoom', () => {
  it('uses the most restrictive max zoom', () => {
    expect(unionMaxZoom([overlayA, overlayB])).toBe(16)
  })

  it('is undefined without any max zoom', () => {
    expect(
      unionMaxZoom([historicalMapOverlay({ maxZoom: undefined })]),
    ).toBeUndefined()
  })
})
