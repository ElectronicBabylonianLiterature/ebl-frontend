import { useEffect, useState, type RefObject } from 'react'
import ResizeObserver from 'resize-observer-polyfill'

interface PanelFootprint {
  readonly width: number
  readonly height: number
}

const ZERO_FOOTPRINT: PanelFootprint = { width: 0, height: 0 }

export default function useMapPanelFootprint(
  containerRef: RefObject<HTMLElement>,
  drawerRef: RefObject<HTMLElement>,
  remeasureKey: unknown,
): PanelFootprint {
  const [footprint, setFootprint] = useState(ZERO_FOOTPRINT)

  useEffect(() => {
    const container = containerRef.current
    const drawer = drawerRef.current
    if (!container || !drawer) {
      setFootprint(ZERO_FOOTPRINT)
      return
    }

    let isActive = true
    const measure = (): void => {
      if (!isActive) return
      const mapBox = container.getBoundingClientRect()
      const panelBox = drawer.getBoundingClientRect()
      const next = {
        width: Math.max(
          0,
          Math.min(mapBox.width, mapBox.right - panelBox.left),
        ),
        height: Math.max(
          0,
          Math.min(mapBox.height, mapBox.bottom - panelBox.top),
        ),
      }
      setFootprint((previous) =>
        previous.width === next.width && previous.height === next.height
          ? previous
          : next,
      )
    }

    const toolbar = drawer
      .closest('.map-panel-dock')
      ?.querySelector('.map-toolbar__bar')
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    observer.observe(drawer)
    if (toolbar) observer.observe(toolbar)
    measure()

    return () => {
      isActive = false
      observer.disconnect()
    }
  }, [containerRef, drawerRef, remeasureKey])

  return footprint
}
