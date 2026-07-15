import React from 'react'
import { renderHook, act } from '@testing-library/react'
import RealiaInfoContext, {
  useRealiaInfoService,
} from 'fragmentarium/ui/text-annotation/RealiaInfoContext'
import { RealiaInfoEntry } from 'fragmentarium/ui/text-annotation/EntityType'
import { realiaEntryFactory } from 'test-support/realia-fixtures'

const infoEntry: RealiaInfoEntry = {
  realiaId: 'realia_000846',
  lemma: 'Apkallu',
  type: ['Divine names'],
}

const pickedEntry = realiaEntryFactory.build({
  id: 'Ziggurat',
  realiaId: 'realia_000999',
  type: ['Objects'],
})

describe('useRealiaInfoService', () => {
  it('builds the lookup from the inline realia info without fetching', () => {
    const { result } = renderHook(() => useRealiaInfoService([infoEntry]))

    expect(result.current.lookup.get('realia_000846')).toEqual({
      lemma: 'Apkallu',
      entityType: 'DIVINE_NAME',
    })
  })

  it('holds an empty lookup when there is no realia info', () => {
    const { result } = renderHook(() => useRealiaInfoService([]))

    expect(result.current.lookup.size).toBe(0)
  })

  it('ignores a registration without an entry', () => {
    const { result } = renderHook(() => useRealiaInfoService([]))

    act(() => result.current.register(undefined))

    expect(result.current.lookup.size).toBe(0)
  })

  it('registers a picked entry alongside the inline info', () => {
    const { result } = renderHook(() => useRealiaInfoService([infoEntry]))

    act(() => result.current.register(pickedEntry))

    expect(result.current.lookup.get('realia_000846')?.lemma).toBe('Apkallu')
    expect(result.current.lookup.get('realia_000999')).toEqual({
      lemma: 'Ziggurat',
      entityType: 'OBJECT_NAME',
    })
  })
})

describe('RealiaInfoContext default value', () => {
  it('provides an empty lookup and a no-op register', () => {
    const { result } = renderHook(() => React.useContext(RealiaInfoContext))

    expect(result.current.lookup.size).toBe(0)
    expect(() => result.current.register(pickedEntry)).not.toThrow()
  })
})
