import { renderHook } from '@testing-library/react'
import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import { resetMapLibreMock } from '__mocks__/maplibre-gl'
import useMapContainerResize from './useMapContainerResize'

let triggerResize: () => void = () => undefined
let mockDisconnect: jest.Mock
let mockObserve: jest.Mock

jest.mock('resize-observer-polyfill', () => {
  class MockResizeObserver {
    readonly observe: jest.Mock
    readonly disconnect: jest.Mock
    readonly unobserve = jest.fn()

    constructor(callback: () => void) {
      triggerResize = callback
      this.observe = mockObserve = jest.fn()
      this.disconnect = mockDisconnect = jest.fn()
    }
  }

  return MockResizeObserver
})

beforeEach(() => {
  resetMapLibreMock()
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('useMapContainerResize', () => {
  it('resizes the map once the observed container reports a change', () => {
    const mapMock = createMapMock()
    const mapRef = { current: asLibreMap(mapMock) }
    const container = document.createElement('div')
    const containerRef = { current: container }

    renderHook(() => useMapContainerResize(containerRef, mapRef))
    expect(mockObserve).toHaveBeenCalledWith(container)

    triggerResize()
    jest.runOnlyPendingTimers()

    expect(mapMock.resize).toHaveBeenCalledTimes(1)
  })

  it('coalesces rapid callbacks into a single resize', () => {
    const mapMock = createMapMock()
    const mapRef = { current: asLibreMap(mapMock) }
    const containerRef = { current: document.createElement('div') }

    renderHook(() => useMapContainerResize(containerRef, mapRef))

    triggerResize()
    triggerResize()
    triggerResize()
    jest.runOnlyPendingTimers()

    expect(mapMock.resize).toHaveBeenCalledTimes(1)
  })

  it('disconnects the observer and cancels a pending frame on unmount', () => {
    const mapMock = createMapMock()
    const mapRef = { current: asLibreMap(mapMock) }
    const containerRef = { current: document.createElement('div') }

    const { unmount } = renderHook(() =>
      useMapContainerResize(containerRef, mapRef),
    )
    triggerResize()
    unmount()
    jest.runOnlyPendingTimers()

    expect(mockDisconnect).toHaveBeenCalled()
    expect(mapMock.resize).not.toHaveBeenCalled()
  })

  it('does nothing when there is no container yet', () => {
    const mapMock = createMapMock()
    const mapRef = { current: asLibreMap(mapMock) }
    const containerRef = { current: null }

    expect(() =>
      renderHook(() => useMapContainerResize(containerRef, mapRef)),
    ).not.toThrow()
  })
})
