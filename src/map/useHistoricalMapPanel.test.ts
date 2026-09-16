import { act, renderHook } from '@testing-library/react'
import useHistoricalMapPanel from './useHistoricalMapPanel'
import { validatedHistoricalMapOverlays } from './historicalOverlays'

const firstOverlay = validatedHistoricalMapOverlays[0]

describe('useHistoricalMapPanel', () => {
  it('starts with no filter', () => {
    const { result } = renderHook(() => useHistoricalMapPanel())

    expect(result.current.filter).toBe('')
    expect(result.current.expandedSiteIds.size).toBe(0)
    expect(result.current.groups.length).toBeGreaterThan(0)
  })

  it('stores a filter', () => {
    const { result } = renderHook(() => useHistoricalMapPanel())

    act(() => result.current.setFilter('Preusser'))

    expect(result.current.filter).toBe('Preusser')
  })

  it('finds a series by id', () => {
    const { result } = renderHook(() => useHistoricalMapPanel())
    const [series] = result.current.series

    expect(result.current.findSeries(series.seriesId)).toBe(series)
    expect(result.current.findSeries('missing-series')).toBeUndefined()
  })

  it('browsing a site filters and expands that site', () => {
    const { result } = renderHook(() => useHistoricalMapPanel())

    act(() => result.current.browseSite(firstOverlay.siteName))

    expect(result.current.filter).toBe(firstOverlay.siteName)
    expect(result.current.expandedSiteIds.has(firstOverlay.siteId)).toBe(true)
  })

  it('browsing an unknown site still filters', () => {
    const { result } = renderHook(() => useHistoricalMapPanel())

    act(() => result.current.browseSite('Nineveh'))

    expect(result.current.filter).toBe('Nineveh')
    expect(result.current.expandedSiteIds.size).toBe(0)
  })

  it('expands sites directly', () => {
    const { result } = renderHook(() => useHistoricalMapPanel())

    act(() => result.current.setExpandedSiteIds(new Set(['assur'])))

    expect(result.current.expandedSiteIds.has('assur')).toBe(true)
  })
})
