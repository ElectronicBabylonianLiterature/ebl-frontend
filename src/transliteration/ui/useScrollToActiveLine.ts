import { RefObject, useEffect } from 'react'

export function scrollLineIntoView(
  element: HTMLElement,
  options?: ScrollIntoViewOptions,
): () => void {
  let cancelled = false
  const fonts = document.fonts
  const scroll = () => {
    if (!cancelled && element.isConnected) {
      element.scrollIntoView(options)
    }
  }

  scroll()
  if (fonts && fonts.status !== 'loaded') {
    void fonts.ready.then(scroll)
  }

  return () => {
    cancelled = true
  }
}

export default function useScrollToActiveLine(
  reference: RefObject<HTMLElement>,
  lineId: string,
  activeLine: string,
): void {
  useEffect(() => {
    const element = reference.current
    return lineId === activeLine && element
      ? scrollLineIntoView(element)
      : undefined
  }, [activeLine, lineId, reference])
}
