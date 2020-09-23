import { useEffect, useRef } from 'react'

//https://reactjs.org/docs/hooks-faq.html
export function usePrevious<T>(value: T): T {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current as T
}
