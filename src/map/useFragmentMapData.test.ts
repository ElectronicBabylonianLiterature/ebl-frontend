import { act, renderHook, waitFor } from '@testing-library/react'
import Bluebird from 'bluebird'
import type { ExcavationPolygonIndex } from 'map/excavationPolygonIndex'
import { IncompatibleFindspotMapDataError } from 'map/findspotMapDataSanitizer'
import type { MapSiteId } from 'map/mapSites'
import useFragmentMapData from 'map/useFragmentMapData'
import {
  SITE_IDS,
  SITES,
  canonicalIndex,
  deferredMapData,
  mappedFindspot,
  serviceReturning,
  status,
} from 'map/useFragmentMapData.testSupport'
import { findspotMapDataDto } from 'test-support/map-fixtures'

describe('useFragmentMapData', () => {
  it('waits for a canonical index, then calls and aggregates all sites', async () => {
    const service = serviceReturning((siteId) =>
      Bluebird.resolve([
        mappedFindspot(
          siteId as MapSiteId,
          SITE_IDS.indexOf(siteId as MapSiteId) + 1,
        ),
      ]),
    )
    const index = canonicalIndex()
    const { result, rerender } = renderHook(
      ({ polygonIndex }) => useFragmentMapData(service, polygonIndex),
      {
        initialProps: {
          polygonIndex: null as ExcavationPolygonIndex | null,
        },
      },
    )

    expect(service.fetchMapData).not.toHaveBeenCalled()
    rerender({ polygonIndex: index })

    await waitFor(() =>
      expect(SITE_IDS.map((siteId) => status(result.current, siteId))).toEqual(
        SITE_IDS.map(() => 'loaded-with-mappings'),
      ),
    )
    expect((service.fetchMapData as jest.Mock).mock.calls).toEqual(
      SITE_IDS.map((siteId) => [siteId]),
    )
    expect(result.current.findspots).toHaveLength(4)
    SITE_IDS.forEach((siteId) => {
      expect(
        result.current.polygonSummaries.get(SITES[siteId].polygonId)
          ?.findspotCount,
      ).toBe(1)
    })
  })

  it('keeps successful sites when one request rejects', async () => {
    const pending = Object.fromEntries(
      SITE_IDS.filter((siteId) => siteId !== 'kalhu').map((siteId) => [
        siteId,
        deferredMapData(),
      ]),
    ) as Record<Exclude<MapSiteId, 'kalhu'>, ReturnType<typeof deferredMapData>>
    const service = serviceReturning((siteId) =>
      siteId === 'kalhu'
        ? Bluebird.reject(new Error('network failure'))
        : pending[siteId as Exclude<MapSiteId, 'kalhu'>].promise,
    )
    const index = canonicalIndex()
    const { result } = renderHook(() => useFragmentMapData(service, index))

    await waitFor(() => expect(status(result.current, 'kalhu')).toBe('error'))
    expect(status(result.current, 'assur')).toBe('loading')
    expect(status(result.current, 'nippur')).toBe('loading')
    expect(status(result.current, 'uruk')).toBe('loading')
    expect(result.current.findspots).toEqual([])

    await act(async () => {
      pending.assur.resolve([mappedFindspot('assur', 1)])
      pending.nippur.resolve([mappedFindspot('nippur', 3)])
      pending.uruk.resolve([mappedFindspot('uruk', 4)])
      await Bluebird.all(Object.values(pending).map(({ promise }) => promise))
    })
    expect(status(result.current, 'assur')).toBe('loaded-with-mappings')
    expect(status(result.current, 'nippur')).toBe('loaded-with-mappings')
    expect(status(result.current, 'uruk')).toBe('loaded-with-mappings')
    expect(result.current.findspots).toHaveLength(3)
  })

  it('publishes fast data while slower sites remain loading', async () => {
    const pending = Object.fromEntries(
      SITE_IDS.map((siteId) => [siteId, deferredMapData()]),
    ) as Record<MapSiteId, ReturnType<typeof deferredMapData>>
    const service = serviceReturning(
      (siteId) => pending[siteId as MapSiteId].promise,
    )
    const index = canonicalIndex()
    const { result } = renderHook(() => useFragmentMapData(service, index))

    await act(async () => {
      pending.assur.resolve([mappedFindspot('assur', 1)])
      await pending.assur.promise
    })
    expect(status(result.current, 'assur')).toBe('loaded-with-mappings')
    expect(status(result.current, 'kalhu')).toBe('loading')
    expect(status(result.current, 'nippur')).toBe('loading')
    expect(status(result.current, 'uruk')).toBe('loading')
    expect(result.current.findspots).toHaveLength(1)

    await act(async () => {
      pending.kalhu.resolve([])
      await pending.kalhu.promise
    })
    expect(status(result.current, 'kalhu')).toBe('loaded-empty')
    expect(status(result.current, 'nippur')).toBe('loading')

    await act(async () => {
      pending.nippur.resolve([mappedFindspot('nippur', 3)])
      pending.uruk.resolve([mappedFindspot('uruk', 4)])
      await Bluebird.all([pending.nippur.promise, pending.uruk.promise])
    })
    expect(status(result.current, 'nippur')).toBe('loaded-with-mappings')
    expect(status(result.current, 'uruk')).toBe('loaded-with-mappings')
  })

  it.each([
    ['unknown', 'assur-missing-checksum'],
    ['cross-site', SITES.kalhu.polygonId],
  ])('marks an %s polygon as incompatible', async (_label, polygonId) => {
    const service = serviceReturning((siteId) =>
      Bluebird.resolve(
        siteId === 'assur'
          ? [
              findspotMapDataDto({
                siteId: 'ASSUR',
                siteName: 'Aššur',
                polygonIds: [polygonId],
              }),
            ]
          : [],
      ),
    )
    const index = canonicalIndex()
    const { result } = renderHook(() => useFragmentMapData(service, index))

    await waitFor(() =>
      expect(status(result.current, 'assur')).toBe('incompatible'),
    )
    expect(result.current.polygonSummaries.size).toBe(0)
  })

  it('maps an incompatible-response error to incompatible', async () => {
    const service = serviceReturning((siteId) =>
      siteId === 'nippur'
        ? Bluebird.reject(
            new IncompatibleFindspotMapDataError('invalid NIPPUR response'),
          )
        : Bluebird.resolve([]),
    )
    const index = canonicalIndex()
    const { result } = renderHook(() => useFragmentMapData(service, index))

    await waitFor(() =>
      expect(status(result.current, 'nippur')).toBe('incompatible'),
    )
    expect(status(result.current, 'assur')).toBe('loaded-empty')
    expect(status(result.current, 'kalhu')).toBe('loaded-empty')
    expect(status(result.current, 'uruk')).toBe('loaded-empty')
  })

  it('ignores stale responses after the service and index change', async () => {
    const pending = Object.fromEntries(
      SITE_IDS.map((siteId) => [siteId, deferredMapData()]),
    ) as Record<MapSiteId, ReturnType<typeof deferredMapData>>
    const staleService = serviceReturning(
      (siteId) => pending[siteId as MapSiteId].promise,
    )
    const currentService = serviceReturning((siteId) =>
      Bluebird.resolve([
        mappedFindspot(
          siteId as MapSiteId,
          SITE_IDS.indexOf(siteId as MapSiteId) + 101,
        ),
      ]),
    )
    const index = canonicalIndex()
    const { result, rerender } = renderHook(
      ({ service, index }) => useFragmentMapData(service, index),
      { initialProps: { service: staleService, index } },
    )

    rerender({ service: currentService, index: canonicalIndex() })
    await waitFor(() =>
      expect(
        result.current.findspots.map(({ findspotId }) => findspotId),
      ).toEqual([101, 102, 103, 104]),
    )

    await act(async () => {
      SITE_IDS.forEach((siteId, siteIndex) =>
        pending[siteId].resolve([mappedFindspot(siteId, siteIndex + 1)]),
      )
      await Bluebird.all(Object.values(pending).map(({ promise }) => promise))
      await Bluebird.delay(0)
    })
    expect(
      result.current.findspots.map(({ findspotId }) => findspotId),
    ).toEqual([101, 102, 103, 104])
  })
})
