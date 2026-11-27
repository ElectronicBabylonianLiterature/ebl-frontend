import { useLayoutEffect, useRef } from 'react'
import _ from 'lodash'

interface PopperOptions {
  readonly enabled: boolean
  readonly placement: string
  readonly onFirstUpdate?: (state: { readonly placement: string }) => void
}

interface PopperState {
  readonly placement: string
  readonly update: () => void
  readonly forceUpdate: () => void
  readonly attributes: Record<string, never>
  readonly styles: { readonly popper: object; readonly arrow: object }
}

export default function usePopper(
  _referenceElement: unknown,
  _popperElement: unknown,
  { enabled, placement, onFirstUpdate = _.noop }: PopperOptions,
): PopperState {
  const firstUpdate = useRef(onFirstUpdate)
  firstUpdate.current = onFirstUpdate

  useLayoutEffect(() => {
    if (enabled) {
      firstUpdate.current({ placement })
    }
  }, [enabled, placement])

  return {
    placement,
    update: _.noop,
    forceUpdate: _.noop,
    attributes: {},
    styles: { popper: {}, arrow: {} },
  }
}
