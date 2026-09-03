import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import ResizeObserver from 'resize-observer-polyfill'

export interface ElementSize {
  readonly width: number
  readonly height: number
}

const ZERO_SIZE: ElementSize = { width: 0, height: 0 }
export default function useElementSize(
  elementRef: RefObject<HTMLElement>,
  remeasureKey: unknown,
): ElementSize {
  const [size, setSize] = useState<ElementSize>(ZERO_SIZE)

  useEffect(() => {
    const element = elementRef.current
    if (!element) {
      setSize(ZERO_SIZE)
      return
    }

    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect
      setSize(box ? { width: box.width, height: box.height } : ZERO_SIZE)
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [elementRef, remeasureKey])

  return size
}
