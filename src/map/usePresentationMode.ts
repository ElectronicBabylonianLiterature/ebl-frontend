import { useCallback, useEffect, useState } from 'react'

export interface PresentationMode {
  readonly isActive: boolean
  readonly enter: () => void
  readonly exit: () => void
}
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
