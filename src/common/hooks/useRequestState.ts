import { useEffect, useRef, useState } from 'react'

export type RequestState<T> =
  | { readonly status: 'unavailable' }
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | { readonly status: 'loaded'; readonly data: T }

export type Request<T> = (signal: AbortSignal) => Promise<T>

export function isPendingOrNonEmpty(
  state: RequestState<readonly unknown[]>,
): boolean {
  return (
    state.status === 'loading' ||
    state.status === 'error' ||
    (state.status === 'loaded' && state.data.length > 0)
  )
}

function initialState<T>(key: string | null): RequestState<T> {
  return key === null ? { status: 'unavailable' } : { status: 'loading' }
}

export default function useRequestState<T>(
  key: string | null,
  request: Request<T>,
): RequestState<T> {
  const latestRequest = useRef(request)
  const [state, setState] = useState<RequestState<T>>(() => initialState(key))
  useEffect(() => {
    latestRequest.current = request
  })
  useEffect(() => {
    setState(initialState(key))
    if (key === null) {
      return
    }
    const controller = new AbortController()
    latestRequest.current(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) {
          setState({ status: 'loaded', data })
        }
      },
      () => {
        if (!controller.signal.aborted) {
          setState({ status: 'error' })
        }
      },
    )
    return (): void => controller.abort()
  }, [key])
  return state
}
