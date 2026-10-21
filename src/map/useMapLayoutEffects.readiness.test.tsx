import React, { useEffect, useRef } from 'react'
import { act, render, screen } from '@testing-library/react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { resetMapLibreMock } from '__mocks__/maplibre-gl'
import { asLibreMap, createMapMock } from 'test-support/maplibre-map-helpers'
import useMapLayoutEffects from 'map/useMapLayoutEffects'
import useIsNarrowViewport from 'map/useIsNarrowViewport'

type ResizeEntry = { contentRect: { width: number; height: number } }
type ResizeCallback = (entries: ResizeEntry[]) => void
const mockObservers = new Map<Element, Set<ResizeCallback>>()
const mockUseIsNarrowViewport = useIsNarrowViewport as jest.MockedFunction<
  typeof useIsNarrowViewport
>

jest.mock('map/useIsNarrowViewport')
jest.mock('resize-observer-polyfill', () => {
  return class MockResizeObserver {
    private readonly elements: Element[] = []
    private readonly callback: (entries: ResizeEntry[]) => void

    constructor(callback: (entries: ResizeEntry[]) => void) {
      this.callback = callback
    }

    observe(element: Element): void {
      this.elements.push(element)
      const callbacks = mockObservers.get(element) ?? new Set<ResizeCallback>()
      callbacks.add(this.callback)
      mockObservers.set(element, callbacks)
    }

    disconnect(): void {
      this.elements.forEach((element) => {
        const callbacks = mockObservers.get(element)
        callbacks?.delete(this.callback)
        if (callbacks?.size === 0) mockObservers.delete(element)
      })
    }
  }
})

function measurePanel(container: HTMLElement, drawer: HTMLElement): void {
  jest.spyOn(container, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    right: 800,
    bottom: 600,
    width: 800,
    height: 600,
  } as DOMRect)
  jest.spyOn(drawer, 'getBoundingClientRect').mockReturnValue({
    left: 440,
    top: 120,
    right: 800,
    bottom: 600,
    width: 360,
    height: 480,
  } as DOMRect)
}

function LoadingMap({
  isReady,
  isPresenting = false,
  map,
}: {
  readonly isReady: boolean
  readonly isPresenting?: boolean
  readonly map: MapLibreMap
}): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  useEffect(() => {
    mapRef.current = isReady ? map : null
  }, [isReady, map])
  useMapLayoutEffects(
    containerRef,
    mapRef,
    drawerRef,
    isPresenting ? null : 'inspector',
    isReady,
  )
  return isReady ? (
    <div ref={containerRef} data-testid="map-container">
      {!isPresenting && <div ref={drawerRef} data-testid="map-drawer" />}
    </div>
  ) : (
    <div>Loading map data...</div>
  )
}

beforeEach(() => {
  resetMapLibreMock()
  mockObservers.clear()
  jest.useFakeTimers()
})

afterEach(() => jest.useRealTimers())

it.each([
  { isNarrow: false, padding: { right: 360, bottom: 0 } },
  { isNarrow: true, padding: { right: 0, bottom: 480 } },
])(
  'subscribes after loading when isNarrow=$isNarrow',
  ({ isNarrow, padding }) => {
    mockUseIsNarrowViewport.mockReturnValue(isNarrow)
    const mapMock = createMapMock()
    const map = asLibreMap(mapMock)
    const { rerender, unmount } = render(
      <LoadingMap isReady={false} map={map} />,
    )
    expect(mockObservers.size).toBe(0)

    rerender(<LoadingMap isReady map={map} />)
    const drawer = screen.getByTestId('map-drawer')
    const container = screen.getByTestId('map-container')
    measurePanel(container, drawer)
    expect(mockObservers.has(drawer)).toBe(true)
    expect(mockObservers.has(container)).toBe(true)
    act(() => {
      mockObservers
        .get(drawer)
        ?.forEach((callback) =>
          callback([{ contentRect: { width: 360, height: 480 } }]),
        )
      mockObservers.get(container)?.forEach((callback) => callback([]))
      jest.runOnlyPendingTimers()
    })

    expect(mapMock.setPadding).toHaveBeenLastCalledWith({
      top: 0,
      left: 0,
      ...padding,
    })
    expect(mapMock.resize).toHaveBeenCalledTimes(1)

    rerender(<LoadingMap isReady isPresenting map={map} />)
    expect(mockObservers.has(drawer)).toBe(false)
    expect(mapMock.setPadding).toHaveBeenLastCalledWith({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    })

    rerender(<LoadingMap isReady map={map} />)
    const restoredDrawer = screen.getByTestId('map-drawer')
    measurePanel(container, restoredDrawer)
    expect(mockObservers.has(restoredDrawer)).toBe(true)
    act(() => {
      mockObservers
        .get(restoredDrawer)
        ?.forEach((callback) =>
          callback([{ contentRect: { width: 360, height: 480 } }]),
        )
    })
    expect(mapMock.setPadding).toHaveBeenLastCalledWith({
      top: 0,
      left: 0,
      ...padding,
    })
    unmount()
    expect(mockObservers.size).toBe(0)
  },
)
