import { act, renderHook } from '@testing-library/react'
import useIsNarrowViewport from './useIsNarrowViewport'

function mockMatchMedia(initialMatches: boolean): {
  changeListeners: Set<(event: { matches: boolean }) => void>
  setMatches: (matches: boolean) => void
} {
  let matches = initialMatches
  const changeListeners = new Set<(event: { matches: boolean }) => void>()

  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    get matches() {
      return matches
    },
    media: query,
    addEventListener: (_type: string, listener: (event: unknown) => void) =>
      changeListeners.add(listener),
    removeEventListener: (_type: string, listener: (event: unknown) => void) =>
      changeListeners.delete(listener),
  }))

  return {
    changeListeners,
    setMatches: (next: boolean) => {
      matches = next
      changeListeners.forEach((listener) => listener({ matches: next }))
    },
  }
}

describe('useIsNarrowViewport', () => {
  it('reflects the current match at mount', () => {
    mockMatchMedia(true)
    expect(renderHook(() => useIsNarrowViewport()).result.current).toBe(true)

    mockMatchMedia(false)
    expect(renderHook(() => useIsNarrowViewport()).result.current).toBe(false)
  })

  it('updates when the media query change fires', () => {
    const { setMatches } = mockMatchMedia(false)
    const { result } = renderHook(() => useIsNarrowViewport())

    expect(result.current).toBe(false)
    act(() => setMatches(true))
    expect(result.current).toBe(true)
  })

  it('removes its listener on unmount', () => {
    const { changeListeners } = mockMatchMedia(false)
    const { unmount } = renderHook(() => useIsNarrowViewport())

    expect(changeListeners.size).toBe(1)
    unmount()
    expect(changeListeners.size).toBe(0)
  })

  it('accepts a custom query', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useIsNarrowViewport('(max-width: 1px)'))
    expect(result.current).toBe(true)
  })

  it('is false when matchMedia is unavailable', () => {
    const original = window.matchMedia
    // @ts-expect-error simulating an environment without matchMedia
    delete window.matchMedia

    expect(renderHook(() => useIsNarrowViewport()).result.current).toBe(false)

    window.matchMedia = original
  })
})
