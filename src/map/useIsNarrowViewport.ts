import { useEffect, useState } from 'react'

export const MAP_MOBILE_BREAKPOINT_QUERY = '(max-width: 767.98px)'

function matches(query: string): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(query).matches
  )
}

/**
 * Tracks whether the map should use its mobile bottom-sheet layout, so
 * behaviour that differs by breakpoint (camera padding side) can follow the
 * same boundary as the CSS. Reactive, unlike a one-off `matchMedia` check.
 */
export default function useIsNarrowViewport(
  query: string = MAP_MOBILE_BREAKPOINT_QUERY,
): boolean {
  const [isNarrow, setIsNarrow] = useState(() => matches(query))

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const mediaQueryList = window.matchMedia(query)
    const update = (): void => setIsNarrow(mediaQueryList.matches)

    update()
    mediaQueryList.addEventListener('change', update)
    return () => mediaQueryList.removeEventListener('change', update)
  }, [query])

  return isNarrow
}
