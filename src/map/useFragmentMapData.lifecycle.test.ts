import { act, renderHook, waitFor } from '@testing-library/react'
import useFragmentMapData from 'map/useFragmentMapData'
import * as mapSiteRegistry from 'map/mapSites'
import {
  SITE_IDS,
  canonicalIndex,
  deferredMapData,
  mappedFindspot,
  serviceReturning,
  status,
} from 'map/useFragmentMapData.testSupport'

it('ignores old request failures after replacing the service and index', async () => {
  const pending = deferredMapData()
  const staleService = serviceReturning(() => pending.promise)
  const currentService = serviceReturning(() => Promise.resolve([]))
  const { result, rerender } = renderHook(
    ({ service, index }) => useFragmentMapData(service, index),
    { initialProps: { service: staleService, index: canonicalIndex() } },
  )
  rerender({ service: currentService, index: canonicalIndex() })
  await waitFor(() =>
    expect(SITE_IDS.map((siteId) => status(result.current, siteId))).toEqual(
      SITE_IDS.map(() => 'loaded-empty'),
    ),
  )
  const current = result.current

  await act(async () => {
    pending.reject(new Error('stale network failure'))
    await pending.promise.catch(() => undefined)
  })

  expect(result.current).toBe(current)
})

it('ignores rejected requests after unmount', async () => {
  const pending = deferredMapData()
  const service = serviceReturning(() => pending.promise)
  const index = canonicalIndex()
  const { result, unmount } = renderHook(() =>
    useFragmentMapData(service, index),
  )
  const current = result.current
  unmount()

  await act(async () => {
    pending.reject(new Error('late network failure'))
    await pending.promise.catch(() => undefined)
  })

  expect(result.current).toBe(current)
})

it.each([{ siteId: 'KALHU' }, { siteName: 'Unknown site' }])(
  'rejects a response with incompatible site metadata %j',
  async (metadata) => {
    const service = serviceReturning((siteId) =>
      Promise.resolve(
        siteId === 'assur'
          ? [{ ...mappedFindspot('assur', 1), ...metadata }]
          : [],
      ),
    )
    const index = canonicalIndex()
    const { result } = renderHook(() => useFragmentMapData(service, index))

    await waitFor(() =>
      expect(status(result.current, 'assur')).toBe('incompatible'),
    )
    expect(result.current.findspots).toEqual([])
  },
)

it('requires the requested site to exist in the canonical index', async () => {
  const service = serviceReturning(() => Promise.resolve([]))
  const index = new Map(canonicalIndex())
  index.delete('assur')
  const { result } = renderHook(() => useFragmentMapData(service, index))

  await waitFor(() =>
    expect(status(result.current, 'assur')).toBe('incompatible'),
  )
})

it('does not request data for an unconfigured site', () => {
  const site = mapSiteRegistry.mapSites()[0]
  const mapSites = jest
    .spyOn(mapSiteRegistry, 'mapSites')
    .mockReturnValue([{ ...site, mapDataSiteParam: null }])
  const service = serviceReturning(() => Promise.resolve([]))
  const index = canonicalIndex()
  try {
    const { result } = renderHook(() => useFragmentMapData(service, index))
    expect(status(result.current, site.siteId)).toBe('not-configured')
    expect(service.fetchMapData).not.toHaveBeenCalled()
  } finally {
    mapSites.mockRestore()
  }
})
