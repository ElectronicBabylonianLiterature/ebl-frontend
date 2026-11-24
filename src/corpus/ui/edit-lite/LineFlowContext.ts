import { createContext, useContext } from 'react'
import _ from 'lodash'
import { AnnotationView } from 'corpus/ui/edit-lite/editLiteState'

export interface LineFlow {
  readonly arrivalView: AnnotationView | null
  readonly lemmatizationDraftLine: string | null
  settleArrival(): void
  advance(view: AnnotationView): void
  holdFocus(): void
  isFocusHeld(): boolean
}

export const stationaryLineFlow: LineFlow = {
  arrivalView: null,
  lemmatizationDraftLine: null,
  settleArrival: _.noop,
  advance: _.noop,
  holdFocus: _.noop,
  isFocusHeld: () => true,
}

const LineFlowContext = createContext<LineFlow>(stationaryLineFlow)

export function isFocusWithin(holder: HTMLElement | null): boolean {
  const focused = document.activeElement
  return focused === document.body || holder?.contains(focused) === true
}

export function useLineFlow(): LineFlow {
  return useContext(LineFlowContext)
}

export default LineFlowContext
