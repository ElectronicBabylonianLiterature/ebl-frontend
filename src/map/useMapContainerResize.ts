import { useEffect } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import type { Map as MapLibreMap } from 'maplibre-gl'

/**
 * Calls `map.resize()` whenever the map container's own box changes size —
 * a global-layout change, an orientation change, or (defensively) a drawer
 * that ever grows back into being a layout column rather than an overlay.
 * Panel open/close alone does not resize the container, since drawers and
 * the bottom sheet are overlays positioned on top of the map frame.
 */
export default function useMapContainerResize(
  containerRef: RefObject<HTMLElement>,
  mapRef: MutableRefObject<MapLibreMap | null>,
): void {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let frame: number | null = null
    const observer = new ResizeObserver(() => {
      if (frame !== null) return
      frame = requestAnimationFrame(() => {
        frame = null
        mapRef.current?.resize()
      })
    })

    observer.observe(container)
    return () => {
      observer.disconnect()
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [containerRef, mapRef])
}
