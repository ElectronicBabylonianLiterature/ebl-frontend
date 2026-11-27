import { useEffect, useState } from 'react'
import SignService from 'signs/application/SignService'
import { MesZlKap2Entry } from 'signs/domain/Sign'

export type MesZlKap2State =
  | { readonly status: 'unavailable' }
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | { readonly status: 'loaded'; readonly entries: readonly MesZlKap2Entry[] }

export function hasMesZlKap2Content(state: MesZlKap2State): boolean {
  return (
    state.status === 'loading' ||
    state.status === 'error' ||
    (state.status === 'loaded' && state.entries.length > 0)
  )
}

export default function useMesZlKap2(
  signName: string,
  signService: SignService,
  allowed: boolean,
): MesZlKap2State {
  const [state, setState] = useState<MesZlKap2State>({
    status: allowed ? 'loading' : 'unavailable',
  })
  useEffect(() => {
    if (!allowed) {
      setState({ status: 'unavailable' })
      return
    }
    setState({ status: 'loading' })
    const controller = new AbortController()
    signService
      .findMesZlKap2(signName, controller.signal)
      .then((entries) => {
        if (!controller.signal.aborted) {
          setState({ status: 'loaded', entries })
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ status: 'error' })
        }
      })
    return () => controller.abort()
  }, [signName, signService, allowed])
  return state
}
