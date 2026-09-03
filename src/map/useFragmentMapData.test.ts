import { renderHook, waitFor } from '@testing-library/react'
import Bluebird from 'bluebird'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import useFragmentMapData from 'map/useFragmentMapData'
import { findspotMapDataDto } from 'test-support/map-fixtures'

function serviceReturning(
  responder: () => Bluebird<readonly ReturnType<typeof findspotMapDataDto>[]>,
): FindspotService {
  return { fetchMapData: jest.fn(responder) } as unknown as FindspotService
}

describe('useFragmentMapData', () => {
  it('aggregates loaded map-data into polygon summaries', async () => {
    const service = serviceReturning(() =>
      Bluebird.resolve([
        findspotMapDataDto({ findspotId: 1, polygonIds: ['p1'] }),
        findspotMapDataDto({ findspotId: 2, polygonIds: ['p1'] }),
      ]),
    )

    const { result } = renderHook(() => useFragmentMapData(service))

    await waitFor(() => expect(result.current.status).toBe('loaded'))
    expect(result.current.polygonSummaries.get('p1')?.findspotCount).toBe(2)
  })

  it('reports an error status when the request rejects', async () => {
    const service = serviceReturning(() => Bluebird.reject(new Error('boom')))

    const { result } = renderHook(() => useFragmentMapData(service))

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.findspots).toEqual([])
  })
})
