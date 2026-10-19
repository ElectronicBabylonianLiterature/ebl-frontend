import { act, renderHook, waitFor } from '@testing-library/react'
import useProvenances, { type ProvenanceSource } from 'map/useProvenances'
import { makeProvenance } from 'map/provenanceTestData'
import type { ProvenanceRecord } from 'fragmentarium/domain/Provenance'

function pendingService() {
  let resolve!: (value: readonly ProvenanceRecord[]) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<readonly ProvenanceRecord[]>((fulfill, fail) => {
    resolve = fulfill
    reject = fail
  })
  const service: ProvenanceSource = { fetchProvenances: () => promise }
  return { service, promise, resolve, reject }
}

it('recovers from a failed service after replacing it', async () => {
  const failed = pendingService()
  const replacement = pendingService()
  const { result, rerender } = renderHook(useProvenances, {
    initialProps: failed.service,
  })
  await act(async () => failed.reject(new Error('unavailable')))
  expect(result.current.error).toBe('unavailable')

  rerender(replacement.service)
  expect(result.current).toEqual({ provenances: null, error: null })
  const provenances = [makeProvenance()]
  await act(async () => replacement.resolve(provenances))
  expect(result.current).toEqual({ provenances, error: null })
})

it.each(['resolve', 'reject'] as const)(
  'ignores an earlier service that later %ss',
  async (outcome) => {
    const earlier = pendingService()
    const replacement = pendingService()
    const { result, rerender } = renderHook(useProvenances, {
      initialProps: earlier.service,
    })
    rerender(replacement.service)
    const provenances = [makeProvenance()]
    await act(async () => replacement.resolve(provenances))

    await act(async () => {
      if (outcome === 'resolve') earlier.resolve([])
      else earlier.reject(new Error('stale failure'))
    })
    expect(result.current).toEqual({ provenances, error: null })
  },
)

it('clears the previous data while a replacement service is loading', async () => {
  const first: ProvenanceSource = {
    fetchProvenances: () => Promise.resolve([makeProvenance()]),
  }
  const { result, rerender } = renderHook(useProvenances, {
    initialProps: first,
  })
  await waitFor(() => expect(result.current.provenances).toHaveLength(1))

  rerender(pendingService().service)
  expect(result.current).toEqual({ provenances: null, error: null })
})
