import React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import SessionContext from 'auth/SessionContext'
import MemorySession, { guestSession, type Session } from 'auth/Session'
import useFragmentMapData from 'map/domain/useFragmentMapData'
import {
  canonicalIndex,
  deferredMapData,
  mappedFindspot,
  serviceReturning,
  status,
} from 'map/domain/useFragmentMapData.testSupport'

it('waits for linked-data demand before requesting any site', async () => {
  const service = serviceReturning(() => Promise.resolve([]))
  const index = canonicalIndex()
  const { result, rerender } = renderHook(
    ({ enabled }) => useFragmentMapData(service, index, enabled),
    { initialProps: { enabled: false } },
  )
  expect(service.fetchMapData).not.toHaveBeenCalled()
  rerender({ enabled: true })
  await waitFor(() =>
    expect(status(result.current, 'assur')).toBe('loaded-empty'),
  )
  expect(service.fetchMapData).toHaveBeenCalledTimes(4)
})

it.each([
  ['guest to authenticated', guestSession, new MemorySession([])],
  ['authenticated to guest', new MemorySession([]), guestSession],
])(
  'clears access-scoped counts, aborts old requests and ignores late responses: %s',
  async (_label, previousSession, nextSession) => {
    let session: Session = previousSession as Session
    const pending = deferredMapData()
    let isCurrentSession = false
    const service = serviceReturning((siteId) =>
      isCurrentSession
        ? Promise.resolve([])
        : siteId === 'assur'
          ? Promise.resolve([mappedFindspot('assur', 1)])
          : pending.promise,
    )
    const index = canonicalIndex()
    function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
      return (
        <SessionContext.Provider value={session}>
          {children}
        </SessionContext.Provider>
      )
    }
    const observed: number[] = []
    const { result, rerender } = renderHook(
      () => {
        const state = useFragmentMapData(service, index)
        observed.push(state.findspots.length)
        return state
      },
      { wrapper: Wrapper },
    )
    await waitFor(() =>
      expect(status(result.current, 'assur')).toBe('loaded-with-mappings'),
    )
    const signal = (service.fetchMapData as jest.Mock).mock
      .calls[0][1] as AbortSignal
    session = nextSession as Session
    isCurrentSession = true
    const firstNextRender = observed.length
    rerender()
    expect(observed[firstNextRender]).toBe(0)
    expect(result.current.findspots).toEqual([])
    expect(signal.aborted).toBe(true)
    await waitFor(() =>
      expect(status(result.current, 'assur')).toBe('loaded-empty'),
    )
    await act(async () => pending.resolve([mappedFindspot('kalhu', 2)]))
    expect(result.current.findspots).toEqual([])
  },
)

it('aborts requests when demand is disabled and hides their prior results', async () => {
  const service = serviceReturning((siteId) =>
    Promise.resolve([mappedFindspot(siteId as 'assur', 1)]),
  )
  const index = canonicalIndex()
  const { result, rerender } = renderHook(
    ({ enabled }) => useFragmentMapData(service, index, enabled),
    { initialProps: { enabled: true } },
  )
  await waitFor(() => expect(result.current.findspots).toHaveLength(4))
  const signal = (service.fetchMapData as jest.Mock).mock
    .calls[0][1] as AbortSignal
  rerender({ enabled: false })
  expect(result.current.findspots).toEqual([])
  expect(signal.aborted).toBe(true)
})
