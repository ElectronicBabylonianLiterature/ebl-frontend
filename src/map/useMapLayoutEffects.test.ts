import { renderHook } from '@testing-library/react'
import useMapLayoutEffects from 'map/useMapLayoutEffects'
import useMapContainerResize from 'map/useMapContainerResize'
import useMapPanelPadding from 'map/useMapPanelPadding'
import useElementSize from 'map/useElementSize'
import useIsNarrowViewport from 'map/useIsNarrowViewport'

jest.mock('map/useMapContainerResize')
jest.mock('map/useMapPanelPadding')
jest.mock('map/useElementSize')
jest.mock('map/useIsNarrowViewport')

const mockUseMapContainerResize = useMapContainerResize as jest.Mock
const mockUseMapPanelPadding = useMapPanelPadding as jest.Mock
const mockUseElementSize = useElementSize as jest.Mock
const mockUseIsNarrowViewport = useIsNarrowViewport as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
  mockUseElementSize.mockReturnValue({ width: 360, height: 480 })
  mockUseIsNarrowViewport.mockReturnValue(false)
})

describe('useMapLayoutEffects', () => {
  it('wires the container resize observer', () => {
    const containerRef = { current: null }
    const mapRef = { current: null }
    const drawerRef = { current: null }

    renderHook(() => useMapLayoutEffects(containerRef, mapRef, drawerRef, null))

    expect(mockUseMapContainerResize).toHaveBeenCalledWith(containerRef, mapRef)
  })

  it('reserves right-side padding sized to the drawer on wide viewports', () => {
    const mapRef = { current: null }
    mockUseIsNarrowViewport.mockReturnValue(false)

    renderHook(() =>
      useMapLayoutEffects(
        { current: null },
        mapRef,
        { current: null },
        'layers',
      ),
    )

    expect(mockUseMapPanelPadding).toHaveBeenCalledWith(
      mapRef,
      true,
      'right',
      360,
    )
  })

  it('reserves bottom padding sized to the sheet on narrow viewports', () => {
    const mapRef = { current: null }
    mockUseIsNarrowViewport.mockReturnValue(true)

    renderHook(() =>
      useMapLayoutEffects(
        { current: null },
        mapRef,
        { current: null },
        'layers',
      ),
    )

    expect(mockUseMapPanelPadding).toHaveBeenCalledWith(
      mapRef,
      true,
      'bottom',
      480,
    )
  })

  it('reports the panel closed when nothing is active', () => {
    const mapRef = { current: null }

    renderHook(() =>
      useMapLayoutEffects({ current: null }, mapRef, { current: null }, null),
    )

    expect(mockUseMapPanelPadding).toHaveBeenCalledWith(
      mapRef,
      false,
      'right',
      360,
    )
  })

  it('remeasures the drawer against the active panel identity', () => {
    const drawerRef = { current: null }

    renderHook(() =>
      useMapLayoutEffects(
        { current: null },
        { current: null },
        drawerRef,
        'layers',
      ),
    )

    expect(mockUseElementSize).toHaveBeenCalledWith(drawerRef, 'layers')
  })
})
