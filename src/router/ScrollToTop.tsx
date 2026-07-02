import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop(): null {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return null
}
