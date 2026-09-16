import { act, renderHook } from '@testing-library/react'
import useElementSize from './useElementSize'

let triggerEntry: (entry: {
  contentRect: { width: number; height: number }
}) => void = () => undefined
let triggerEmpty: () => void = () => undefined
let mockDisconnect: jest.Mock

jest.mock('resize-observer-polyfill', () => {
  class MockResizeObserver {
    readonly disconnect: jest.Mock

    constructor(
      callback: (
        entries: { contentRect: { width: number; height: number } }[],
      ) => void,
    ) {
      triggerEntry = (entry) => callback([entry])
      triggerEmpty = () => callback([])
      this.disconnect = mockDisconnect = jest.fn()
    }

    observe(): void {
      return undefined
    }
  }

  return MockResizeObserver
})

describe('useElementSize', () => {
  it('starts at zero before anything is measured', () => {
    const elementRef = { current: null }
    const { result } = renderHook(() => useElementSize(elementRef, 'closed'))

    expect(result.current).toEqual({ width: 0, height: 0 })
  })

  it('reports the observed content rect', () => {
    const elementRef = { current: document.createElement('div') }
    const { result } = renderHook(() => useElementSize(elementRef, 'open'))

    act(() => triggerEntry({ contentRect: { width: 360, height: 480 } }))

    expect(result.current).toEqual({ width: 360, height: 480 })
  })

  it('re-measures when the remeasure key changes to a freshly mounted node', () => {
    const elementRef = { current: document.createElement('div') }
    const { result, rerender } = renderHook(
      ({ key }) => useElementSize(elementRef, key),
      { initialProps: { key: 'closed' } },
    )

    rerender({ key: 'open' })
    act(() => triggerEntry({ contentRect: { width: 300, height: 200 } }))

    expect(result.current).toEqual({ width: 300, height: 200 })
  })

  it('stays at zero when the observer reports no entries', () => {
    const elementRef = { current: document.createElement('div') }
    const { result } = renderHook(() => useElementSize(elementRef, 'open'))

    act(() => triggerEmpty())

    expect(result.current).toEqual({ width: 0, height: 0 })
  })

  it('disconnects the observer on unmount', () => {
    const elementRef = { current: document.createElement('div') }
    const { unmount } = renderHook(() => useElementSize(elementRef, 'open'))

    unmount()

    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('resets to zero once the element is gone', () => {
    const elementRef: { current: HTMLElement | null } = {
      current: document.createElement('div'),
    }
    const { result, rerender } = renderHook(
      ({ key }) => useElementSize(elementRef, key),
      { initialProps: { key: 'open' } },
    )
    act(() => triggerEntry({ contentRect: { width: 300, height: 200 } }))
    expect(result.current).toEqual({ width: 300, height: 200 })

    elementRef.current = null
    rerender({ key: 'closed' })

    expect(result.current).toEqual({ width: 0, height: 0 })
  })
})
