import { useCallback, useEffect, useState } from 'react'
import prefersReducedMotion from 'common/utils/prefersReducedMotion'

function mergeOpenSections(
  previous: Readonly<Record<string, boolean>>,
  sectionIds: readonly string[],
): Record<string, boolean> {
  return Object.fromEntries(sectionIds.map((id) => [id, previous[id] ?? true]))
}

export function useEntrySectionState(sectionIds: readonly string[]): {
  openSections: Record<string, boolean>
  toggleSection: (id: string) => void
  openSection: (id: string) => void
} {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => mergeOpenSections({}, sectionIds),
  )

  useEffect(() => {
    setOpenSections((previous) => mergeOpenSections(previous, sectionIds))
  }, [sectionIds])

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
