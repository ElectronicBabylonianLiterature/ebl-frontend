import { useCallback, useEffect, useState } from 'react'

export interface PresentationMode {
  readonly isActive: boolean
  readonly enter: () => void
  readonly exit: () => void
}

/**
 * A view-only layout switch: it hides application chrome and every panel, and
 * touches nothing else. Selection, camera, overlays, terrain, filters and the
 * visualization mode all survive it because none of them live here — and it
 * stays out of the URL, so a shared link never traps its recipient in a mode
 * they did not ask for.
 */
export default function usePresentationMode(): PresentationMode {
  const [isActive, setIsActive] = useState(false)

  const exit = useCallback(() => setIsActive(false), [])

  useEffect(() => {
    if (!isActive) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') exit()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isActive, exit])

  return {
    isActive,
    enter: useCallback(() => setIsActive(true), []),
    exit,
  }
}
