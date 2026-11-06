import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

export default function useMapPresentationFocus(
  triggerRef: RefObject<HTMLButtonElement>,
  isPresenting: boolean,
): void {
  const wasPresentingRef = useRef(false)
  useEffect(() => {
    if (wasPresentingRef.current && !isPresenting) triggerRef.current?.focus()
    wasPresentingRef.current = isPresenting
  }, [isPresenting, triggerRef])
}
