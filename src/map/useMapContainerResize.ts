import { useEffect } from 'react'
import type { MutableRefObject, RefObject } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import type { Map as MapLibreMap } from 'maplibre-gl'
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
