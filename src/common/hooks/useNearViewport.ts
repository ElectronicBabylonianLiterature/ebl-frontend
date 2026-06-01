import { useEffect, useMemo, useState } from 'react'

type UseNearViewportResult = {
  readonly containerRef: (element: HTMLElement | null) => void
  readonly isNearViewport: boolean
}

const unsupportedByEnvironment = typeof IntersectionObserver === 'undefined'

export default function useNearViewport(
  rootMargin = '200px',
): UseNearViewportResult {
  const [element, setElement] = useState<HTMLElement | null>(null)
  const [isNearViewport, setIsNearViewport] = useState(unsupportedByEnvironment)

  const containerRef = useMemo(
    () => (nextElement: HTMLElement | null) => {
      setElement(nextElement)
    },
    [],
  )

  useEffect(() => {
    if (isNearViewport || unsupportedByEnvironment || !element) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some(
          (entry) => entry.isIntersecting || entry.intersectionRatio > 0,
        )

        if (visible) {
          setIsNearViewport(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [element, isNearViewport, rootMargin])

  return {
    containerRef,
    isNearViewport,
  }
}
