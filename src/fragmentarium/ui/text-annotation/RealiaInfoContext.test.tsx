import React from 'react'
import Bluebird from 'bluebird'
import { renderHook, act, waitFor } from '@testing-library/react'
import RealiaInfoContext, {
  useRealiaInfoService,
} from 'fragmentarium/ui/text-annotation/RealiaInfoContext'
import { realiaEntryFactory } from 'test-support/realia-fixtures'
import {
  realiaServiceMock,
  WithRealiaService,
} from 'fragmentarium/ui/text-annotation/textAnnotation.testSupport'

jest.mock('realia/application/RealiaService')

const entry = realiaEntryFactory.build({
  id: 'Apkallu',
  realiaId: 'realia_000846',
  type: ['Divine names'],
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WithRealiaService>{children}</WithRealiaService>
)

describe('useRealiaInfoService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('resolves the lemma of each realiaId through the service', async () => {
    realiaServiceMock.find.mockReturnValue(Bluebird.resolve(entry))
    const { result } = renderHook(
      () => useRealiaInfoService(['realia_000846']),
      { wrapper },
    )

    await waitFor(() =>
      expect(result.current.lookup.get('realia_000846')).toEqual({
        lemma: 'Apkallu',
        entityType: 'DIVINE_NAME',
      }),
    )
    expect(realiaServiceMock.find).toHaveBeenCalledWith('realia_000846')
  })

  it('does not fetch when there are no realia annotations', () => {
    renderHook(() => useRealiaInfoService([]), { wrapper })

    expect(realiaServiceMock.find).not.toHaveBeenCalled()
  })

  it('requests each realiaId only once across re-renders', async () => {
    realiaServiceMock.find.mockReturnValue(Bluebird.resolve(entry))
    const { rerender, result } = renderHook(
      () => useRealiaInfoService(['realia_000846']),
      { wrapper },
    )

    await waitFor(() => expect(result.current.lookup.size).toBe(1))
    rerender()

    expect(realiaServiceMock.find).toHaveBeenCalledTimes(1)
  })

  it('leaves the lemma unresolved when the lookup fails', async () => {
    realiaServiceMock.find.mockReturnValue(
      Bluebird.reject(new Error('not found')) as Bluebird<never>,
    )
    const { result } = renderHook(() => useRealiaInfoService(['realia_404']), {
      wrapper,
    })

    await waitFor(() => expect(realiaServiceMock.find).toHaveBeenCalled())
    expect(result.current.lookup.has('realia_404')).toBe(false)
  })

  it('ignores a registration without an entry', () => {
    const { result } = renderHook(() => useRealiaInfoService([]), { wrapper })

    act(() => result.current.register(undefined))

    expect(result.current.lookup.size).toBe(0)
  })

  it('registers a picked entry without fetching it', async () => {
    const { result } = renderHook(() => useRealiaInfoService([]), { wrapper })

    act(() => result.current.register(entry))

    await waitFor(() =>
      expect(result.current.lookup.get('realia_000846')?.lemma).toBe('Apkallu'),
    )
    expect(realiaServiceMock.find).not.toHaveBeenCalled()
  })
})

describe('RealiaInfoContext default value', () => {
  it('provides an empty lookup and a no-op register', () => {
    const { result } = renderHook(() => React.useContext(RealiaInfoContext))

    expect(result.current.lookup.size).toBe(0)
    expect(() => result.current.register(entry)).not.toThrow()
  })
})
