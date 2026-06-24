import { useEffect, useState } from 'react'

export default function useActiveSection(
  ids: readonly string[],
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)

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

  return activeId
}
