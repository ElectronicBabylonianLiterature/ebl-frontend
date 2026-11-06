import { act, renderHook } from '@testing-library/react'
import useMapPanelFootprint from 'map/useMapPanelFootprint'

const mockObserved = new Map<Element, () => void>()
const mockDisconnect = jest.fn()

jest.mock('resize-observer-polyfill', () => {
  return class MockResizeObserver {
    private readonly elements: Element[] = []
    private readonly callback: () => void

    constructor(callback: () => void) {
      this.callback = callback
    }

    observe(element: Element): void {
      this.elements.push(element)
      mockObserved.set(element, this.callback)
    }

    disconnect(): void {
      this.elements.forEach((element) => mockObserved.delete(element))
      mockDisconnect()
    }
  }
})

function box(
  left: number,
  top: number,
  width: number,
  height: number,
): DOMRect {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  } as DOMRect
}

function fixture(withToolbar = true): {
  container: HTMLDivElement
  drawer: HTMLElement
  toolbar: HTMLDivElement
  setContainerBox: (value: DOMRect) => void
  setDrawerBox: (value: DOMRect) => void
} {
  const container = document.createElement('div')
  const dock = document.createElement('div')
  const drawer = document.createElement('section')
  const toolbar = document.createElement('div')
  dock.className = 'map-panel-dock'
  toolbar.className = 'map-toolbar__bar'
  dock.append(drawer)
  if (withToolbar) dock.append(toolbar)
  let containerBox = box(10, 20, 800, 600)
  let drawerBox = box(430, 220, 368, 300)
  jest
    .spyOn(container, 'getBoundingClientRect')
    .mockImplementation(() => containerBox)
  jest
    .spyOn(drawer, 'getBoundingClientRect')
    .mockImplementation(() => drawerBox)
  return {
    container,
    drawer,
    toolbar,
    setContainerBox: (value) => {
      containerBox = value
    },
    setDrawerBox: (value) => {
      drawerBox = value
    },
  }
}

beforeEach(() => {
  mockObserved.clear()
  mockDisconnect.mockClear()
})

it.each(['container', 'drawer'] as const)(
  'has no footprint without a %s',
  (missing) => {
    const container = document.createElement('div')
    const drawer = document.createElement('section')
    const { result } = renderHook(() =>
      useMapPanelFootprint(
        { current: missing === 'container' ? null : container },
        { current: missing === 'drawer' ? null : drawer },
        'layers',
      ),
    )
    expect(result.current).toEqual({ width: 0, height: 0 })
    expect(mockObserved.size).toBe(0)
  },
)

it('measures the complete footprint immediately, including bottom and right gaps', () => {
  const { container, drawer, toolbar } = fixture()
  const { result } = renderHook(() =>
    useMapPanelFootprint({ current: container }, { current: drawer }, 'layers'),
  )
  expect(result.current).toEqual({ width: 380, height: 400 })
  expect([...mockObserved.keys()]).toEqual([container, drawer, toolbar])
  const original = result.current
  act(() => mockObserved.get(drawer)?.())
  expect(result.current).toBe(original)
})

it('remeasures when a wrapping toolbar moves a drawer without changing its size', () => {
  const { container, drawer, toolbar, setDrawerBox } = fixture()
  const { result } = renderHook(() =>
    useMapPanelFootprint({ current: container }, { current: drawer }, 'layers'),
  )
  setDrawerBox(box(430, 170, 368, 300))
  act(() => mockObserved.get(toolbar)?.())
  expect(result.current).toEqual({ width: 380, height: 450 })
})

it('tracks a collapsed sheet and viewport changes through both observed boxes', () => {
  const { container, drawer, setDrawerBox, setContainerBox } = fixture()
  const { result } = renderHook(() =>
    useMapPanelFootprint({ current: container }, { current: drawer }, 'layers'),
  )
  setDrawerBox(box(18, 470, 784, 50))
  act(() => mockObserved.get(drawer)?.())
  expect(result.current).toEqual({ width: 792, height: 150 })
  setContainerBox(box(10, 20, 400, 700))
  setDrawerBox(box(18, 570, 384, 50))
  act(() => mockObserved.get(container)?.())
  expect(result.current).toEqual({ width: 392, height: 150 })
})

it.each([
  { drawerBox: box(-20, -10, 300, 200), expected: { width: 800, height: 600 } },
  { drawerBox: box(900, 700, 300, 200), expected: { width: 0, height: 0 } },
])('bounds the footprint to the map viewport', ({ drawerBox, expected }) => {
  const { container, drawer, setDrawerBox } = fixture(false)
  setDrawerBox(drawerBox)
  const { result } = renderHook(() =>
    useMapPanelFootprint({ current: container }, { current: drawer }, 'layers'),
  )
  expect(result.current).toEqual(expected)
  expect(mockObserved.size).toBe(2)
})

it('disconnects and resets on presentation, then measures the remounted drawer', () => {
  const first = fixture()
  const containerRef = { current: first.container }
  const drawerRef: { current: HTMLElement | null } = { current: first.drawer }
  const { result, rerender, unmount } = renderHook(
    ({ panel }) => useMapPanelFootprint(containerRef, drawerRef, panel),
    { initialProps: { panel: 'layers' as string | null } },
  )
  const staleCallback = mockObserved.get(first.drawer)
  drawerRef.current = null
  rerender({ panel: null })
  expect(result.current).toEqual({ width: 0, height: 0 })
  expect(mockDisconnect).toHaveBeenCalledTimes(1)
  expect(mockObserved.size).toBe(0)
  act(() => staleCallback?.())
  expect(result.current).toEqual({ width: 0, height: 0 })
  const next = fixture()
  next.setDrawerBox(box(430, 120, 368, 400))
  drawerRef.current = next.drawer
  rerender({ panel: 'export' })
  expect(result.current).toEqual({ width: 380, height: 500 })
  expect(mockObserved.has(next.drawer)).toBe(true)
  unmount()
  expect(mockObserved.size).toBe(0)
  expect(mockDisconnect).toHaveBeenCalledTimes(2)
})
