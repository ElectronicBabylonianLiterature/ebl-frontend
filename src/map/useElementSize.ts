import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import ResizeObserver from 'resize-observer-polyfill'

export interface ElementSize {
  readonly width: number
  readonly height: number
}

const ZERO_SIZE: ElementSize = { width: 0, height: 0 }

/**
 * The rendered size of an element, tracked live. Used so camera padding for
 * the panel drawer reflects its actual box rather than a constant duplicated
 * from Sass, which would drift out of sync with the real layout.
 *
 * `remeasureKey` should change whenever the ref's target element is expected
 * to have been created or removed (e.g. the panel's open/closed state) —
 * `elementRef` itself never changes identity, so React would not otherwise
 * know to re-attach the observer to a freshly mounted node.
 */
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
