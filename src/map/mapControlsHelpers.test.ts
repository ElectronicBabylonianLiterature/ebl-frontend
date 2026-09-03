import type { Dispatch, SetStateAction } from 'react'
import { historicalMapOverlay } from 'test-support/map-fixtures'
import {
  groupActiveCount,
  linkedExcavationAreaLabel,
  matchesHistoricalMapFilter,
  toggleExpandedSite,
} from './mapControlsHelpers'

describe('matchesHistoricalMapFilter', () => {
  const overlay = historicalMapOverlay({
    title: 'Andrae 1938 Aššur, Beilage',
    shortTitle: 'Andrae 1938',
  })

  it('matches everything when the filter is blank', () => {
    expect(matchesHistoricalMapFilter(overlay, '  ')).toBe(true)
  })

  it('matches case-insensitively against the title', () => {
    expect(matchesHistoricalMapFilter(overlay, 'andrae')).toBe(true)
  })

  it('does not match an unrelated filter', () => {
    expect(matchesHistoricalMapFilter(overlay, 'nimrud')).toBe(false)
  })
})

describe('groupActiveCount', () => {
  it('counts only the overlays that are active', () => {
    const first = historicalMapOverlay({ id: 'a' })
    const second = historicalMapOverlay({ id: 'b' })

    expect(
      groupActiveCount(
        { siteId: 'assur', siteName: 'Aššur', overlays: [first, second] },
        new Set(['a']),
      ),
    ).toBe(1)
  })
})

describe('linkedExcavationAreaLabel', () => {
  it('uses the singular for exactly one', () => {
    expect(linkedExcavationAreaLabel(1)).toBe('1 linked area')
  })

  it('uses the plural otherwise', () => {
    expect(linkedExcavationAreaLabel(0)).toBe('0 linked areas')
    expect(linkedExcavationAreaLabel(3)).toBe('3 linked areas')
  })
})

describe('toggleExpandedSite', () => {
  it('expands a collapsed site', () => {
    let expanded = new Set<string>()
    const setExpandedSiteIds: Dispatch<SetStateAction<Set<string>>> = (
      update,
    ) => {
      expanded = typeof update === 'function' ? update(expanded) : update
    }

    toggleExpandedSite(setExpandedSiteIds, 'assur')

    expect(expanded.has('assur')).toBe(true)
  })

  it('collapses an already-expanded site', () => {
    let expanded = new Set<string>(['assur'])
    const setExpandedSiteIds: Dispatch<SetStateAction<Set<string>>> = (
      update,
    ) => {
      expanded = typeof update === 'function' ? update(expanded) : update
    }

    toggleExpandedSite(setExpandedSiteIds, 'assur')

    expect(expanded.has('assur')).toBe(false)
  })
})
