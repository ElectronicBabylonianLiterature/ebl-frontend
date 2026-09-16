import { renderHook, act } from '@testing-library/react'
import useMapPanel from './useMapPanel'

describe('useMapPanel', () => {
  it('starts closed by default', () => {
    const { result } = renderHook(() => useMapPanel())
    expect(result.current.active).toBeNull()
  })

  it('accepts an initial panel', () => {
    const { result } = renderHook(() => useMapPanel('inspector'))
    expect(result.current.active).toBe('inspector')
  })

  it('opens a panel unconditionally, closing any other', () => {
    const { result } = renderHook(() => useMapPanel('layers'))

    act(() => result.current.open('terrain'))
    expect(result.current.active).toBe('terrain')

    act(() => result.current.open('terrain'))
    expect(result.current.active).toBe('terrain')
  })

  it('toggles a panel closed when it is already active', () => {
    const { result } = renderHook(() => useMapPanel())

    act(() => result.current.toggle('export'))
    expect(result.current.active).toBe('export')

    act(() => result.current.toggle('export'))
    expect(result.current.active).toBeNull()
  })

  it('switches panels via toggle rather than stacking them', () => {
    const { result } = renderHook(() => useMapPanel('export'))

    act(() => result.current.toggle('measurement'))
    expect(result.current.active).toBe('measurement')
  })

  it('closes whatever panel is open', () => {
    const { result } = renderHook(() => useMapPanel('inspector'))

    act(() => result.current.close())
    expect(result.current.active).toBeNull()
  })
})
