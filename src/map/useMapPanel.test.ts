import { renderHook, act } from '@testing-library/react'
import useMapPanel from './useMapPanel'

describe('useMapPanel', () => {
  it('starts closed by default', () => {
    const { result } = renderHook(() => useMapPanel())
    expect(result.current.active).toBeNull()
  })

  it('accepts an initial panel', () => {
    const { result } = renderHook(() => useMapPanel('layers'))
    expect(result.current.active).toBe('layers')
  })

  it('opens a panel unconditionally', () => {
    const { result } = renderHook(() => useMapPanel())

    act(() => result.current.open('layers'))
    expect(result.current.active).toBe('layers')
  })

  it('toggles a panel closed when it is already active', () => {
    const { result } = renderHook(() => useMapPanel())

    act(() => result.current.toggle('layers'))
    expect(result.current.active).toBe('layers')

    act(() => result.current.toggle('layers'))
    expect(result.current.active).toBeNull()
  })

  it('closes whatever panel is open', () => {
    const { result } = renderHook(() => useMapPanel('layers'))

    act(() => result.current.close())
    expect(result.current.active).toBeNull()
  })
})
