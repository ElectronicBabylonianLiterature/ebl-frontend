import { useEffect } from 'react'

const interactions = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const

export default function useKeepSectionInView(
  sectionId: string | null,
  content: HTMLElement | null,
): void {
  useEffect(() => {
    if (
      sectionId === null ||
      content === null ||
      typeof ResizeObserver === 'undefined'
    ) {
      return
    }
    const observer = new ResizeObserver(() =>
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'auto' }),
    )
    const stop = (): void => observer.disconnect()
    observer.observe(content)
    interactions.forEach((type) =>
      window.addEventListener(type, stop, { once: true, passive: true }),
    )
    return (): void => {
      stop()
      interactions.forEach((type) => window.removeEventListener(type, stop))
    }
  }, [sectionId, content])
}
