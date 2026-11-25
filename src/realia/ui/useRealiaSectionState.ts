import { useCallback, useEffect, useMemo, useState } from 'react'
import prefersReducedMotion from 'common/utils/prefersReducedMotion'

export function useRealiaSectionState(sectionIds: readonly string[]): {
  openSections: Record<string, boolean>
  toggleSection: (id: string) => void
  openSection: (id: string) => void
} {
  const initialState = useMemo(
    () => Object.fromEntries(sectionIds.map((id) => [id, true])),
    [sectionIds],
  )
  const [openSections, setOpenSections] =
    useState<Record<string, boolean>>(initialState)

  useEffect(() => {
    setOpenSections(initialState)
  }, [initialState])

  const toggleSection = useCallback((id: string): void => {
    setOpenSections((previous) => ({ ...previous, [id]: !previous[id] }))
  }, [])

  const openSection = useCallback((id: string): void => {
    setOpenSections((previous) => ({ ...previous, [id]: true }))
  }, [])

  return { openSections, toggleSection, openSection }
}

function moveFocusTo(element: HTMLElement | null): void {
  if (!element) {
    return
  }
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '-1')
  }
  element.focus({ preventScroll: true })
}

export function scrollToSection(id: string): void {
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth'
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const element = document.getElementById(id)
      element?.scrollIntoView({ behavior })
      moveFocusTo(element)
    })
  })
}
