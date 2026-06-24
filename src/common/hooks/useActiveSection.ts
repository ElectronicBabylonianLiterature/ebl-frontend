import { useCallback, useEffect, useRef, useState } from 'react'

const PROGRAMMATIC_SCROLL_LOCK_MS = 800

export default function useActiveSection(ids: readonly string[]): {
  activeId: string | null
  selectActiveSection: (id: string) => void
} {
  const [activeId, setActiveId] = useState<string | null>(null)
  const lockedUntil = useRef(0)

  useEffect(() => {
    if (ids.length === 0) {
      return
    }

    const visibleIds = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id)
          } else {
            visibleIds.delete(entry.target.id)
          }
        })
        if (performance.now() < lockedUntil.current) {
          return
        }
        const active = ids.find((id) => visibleIds.has(id))
        if (active) {
          setActiveId(active)
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 },
    )

    ids.forEach((id) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return (): void => observer.disconnect()
  }, [ids])

  const selectActiveSection = useCallback((id: string): void => {
    lockedUntil.current = performance.now() + PROGRAMMATIC_SCROLL_LOCK_MS
    setActiveId(id)
  }, [])

  return { activeId, selectActiveSection }
}
