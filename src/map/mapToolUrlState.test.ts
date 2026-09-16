import { DEFAULT_COMPARISON_STATE } from './mapComparison'
import { DEFAULT_TIMELINE_STATE } from './overlayTimelineFilter'
import {
  DEFAULT_MAP_TOOL_URL_STATE,
  parseComparisonState,
  parseMapToolUrlState,
  parseTimelineState,
  serializeComparisonState,
  serializeMapToolUrlState,
  serializeTimelineState,
} from './mapToolUrlState'

const KNOWN = new Set(['overlay-a', 'overlay-b'])

describe('parseComparisonState', () => {
  it('is the default when absent', () => {
    expect(parseComparisonState(null, KNOWN)).toEqual(DEFAULT_COMPARISON_STATE)
    expect(parseComparisonState('', KNOWN)).toEqual(DEFAULT_COMPARISON_STATE)
  })

  it('rejects an unknown mode', () => {
    expect(parseComparisonState('teleport:overlay-a::0.5', KNOWN)).toEqual(
      DEFAULT_COMPARISON_STATE,
    )
  })

  it('reads a full comparison', () => {
    expect(
      parseComparisonState('opacity:overlay-a:overlay-b:0.25', KNOWN),
    ).toEqual({
      mode: 'opacity',
      leftOverlayId: 'overlay-a',
      rightOverlayId: 'overlay-b',
      blendPosition: 0.25,
      soloSide: null,
    })
  })

  it('drops overlay ids the catalogue does not know', () => {
    expect(
      parseComparisonState('opacity:ghost:overlay-b:0.5', KNOWN),
    ).toMatchObject({ leftOverlayId: null, rightOverlayId: 'overlay-b' })
  })

  it('treats a missing side as the base map', () => {
    expect(parseComparisonState('opacity', KNOWN)).toMatchObject({
      leftOverlayId: null,
      rightOverlayId: null,
      blendPosition: 0.5,
    })
  })

  it('never restores a solo state from a link', () => {
    expect(
      parseComparisonState('opacity:overlay-a:overlay-b:1', KNOWN).soloSide,
    ).toBeNull()
  })
})

describe('serializeComparisonState', () => {
  it('is omitted while comparison is off', () => {
    expect(serializeComparisonState(DEFAULT_COMPARISON_STATE)).toBeUndefined()
  })

  it('round-trips through the parser', () => {
    const state = parseComparisonState(
      'opacity:overlay-a:overlay-b:0.25',
      KNOWN,
    )

    expect(serializeComparisonState(state)).toBe(
      'opacity:overlay-a:overlay-b:0.25',
    )
    expect(
      parseComparisonState(serializeComparisonState(state) ?? '', KNOWN),
    ).toEqual(state)
  })

  it('rounds the blend position to two decimals', () => {
    expect(
      serializeComparisonState({
        ...DEFAULT_COMPARISON_STATE,
        mode: 'opacity',
        blendPosition: 0.123456,
      }),
    ).toBe('opacity:::0.12')
  })
})

describe('parseTimelineState', () => {
  it('is the default when absent', () => {
    expect(parseTimelineState(null)).toEqual(DEFAULT_TIMELINE_STATE)
    expect(parseTimelineState('')).toEqual(DEFAULT_TIMELINE_STATE)
  })

  it('reads a bounded range that excludes undated maps', () => {
    expect(parseTimelineState('1938,1955:0')).toEqual({
      startYear: 1938,
      endYear: 1955,
      includeUndated: false,
    })
  })

  it('reads an open-ended range', () => {
    expect(parseTimelineState('1938,:1')).toMatchObject({
      startYear: 1938,
      endYear: null,
    })
    expect(parseTimelineState(',1955:1')).toMatchObject({
      startYear: null,
      endYear: 1955,
    })
  })

  it.each(['abc,1955:1', '1200,1955:1', '99999,1955:1', '1938.5,1955:1'])(
    'rejects an implausible start year in %s',
    (value) => {
      expect(parseTimelineState(value).startYear).toBeNull()
    },
  )

  it('repairs an inverted range rather than showing nothing', () => {
    expect(parseTimelineState('1955,1938:1')).toMatchObject({
      startYear: 1955,
      endYear: 1955,
    })
  })

  it('defaults to including undated maps', () => {
    expect(parseTimelineState('1938,1955').includeUndated).toBe(true)
  })
})

describe('serializeTimelineState', () => {
  it('is omitted while the timeline is inert', () => {
    expect(serializeTimelineState(DEFAULT_TIMELINE_STATE)).toBeUndefined()
  })

  it.each([
    [{ startYear: 1938, endYear: 1955, includeUndated: false }, '1938,1955:0'],
    [{ startYear: null, endYear: null, includeUndated: false }, ',:0'],
    [{ startYear: 1938, endYear: null, includeUndated: true }, '1938,:1'],
  ])('writes %o as %s', (state, expected) => {
    expect(serializeTimelineState(state)).toBe(expected)
  })
})

describe('the whole tool state', () => {
  it('is the default for an empty query', () => {
    expect(parseMapToolUrlState({}, KNOWN)).toEqual(DEFAULT_MAP_TOOL_URL_STATE)
    expect(serializeMapToolUrlState(DEFAULT_MAP_TOOL_URL_STATE)).toEqual({})
  })

  it('round-trips terrain, comparison and timeline together', () => {
    const query = {
      t: '1',
      cmp: 'opacity:overlay-a:overlay-b:0.25',
      yr: '1938,1955:0',
    }
    const parsed = parseMapToolUrlState(query, KNOWN)

    expect(parsed.terrain).toBe(true)
    expect(serializeMapToolUrlState(parsed)).toEqual(query)
  })

  it('treats any terrain value other than 1 as off', () => {
    expect(parseMapToolUrlState({ t: 'yes' }, KNOWN).terrain).toBe(false)
  })
})
