import { useLayoutEffect, useRef, type FocusEvent } from 'react'

export default function useMatchControlFocus(
  expanded: boolean,
  loading: boolean,
) {
  const controlsRef = useRef<HTMLDivElement>(null)
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const collapseButtonRef = useRef<HTMLButtonElement>(null)
  const controlsHadFocus = useRef(false)

  useLayoutEffect(() => {
    if (controlsHadFocus.current && document.activeElement === document.body) {
      const control =
        expanded || loading ? collapseButtonRef.current : moreButtonRef.current
      const focusTarget = control ?? controlsRef.current
      focusTarget?.focus()
    }
  })

  const onFocusCapture = (): void => {
    controlsHadFocus.current = true
  }
  const onBlurCapture = (event: FocusEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget))
      controlsHadFocus.current = false
  }
  return {
    controlsRef,
    moreButtonRef,
    collapseButtonRef,
    onFocusCapture,
    onBlurCapture,
  }
}
