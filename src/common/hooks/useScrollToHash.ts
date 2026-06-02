import { useEffect } from 'react'
import prefersReducedMotion from 'common/utils/prefersReducedMotion'

export default function useScrollToHash(hash: string): void {
  useEffect(() => {
    if (!hash) {
      return
    }

    const id = hash.replace('#', '')
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth'

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior })
        }
      })
    })
  }, [hash])
}
