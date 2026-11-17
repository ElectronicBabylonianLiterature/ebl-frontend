import { Fragment } from 'fragmentarium/domain/fragment'

export const EXPANSION_BATCH_SIZE = 10

export function initialExpansionState(linesToShow: number) {
  return {
    loadedFragment: null as Fragment | null,
    expanded: false,
    loading: false,
    error: false,
    unavailable: false,
    visibleCount: linesToShow,
  }
}

type ExpansionState = ReturnType<typeof initialExpansionState>
type Action =
  | { type: 'reset' | 'collapse'; linesToShow: number }
  | { type: 'request' | 'failure' | 'unavailable' }
  | {
      type: 'loaded'
      fragment: Fragment
      initialVisibleCount: number
      availableCount: number
    }
  | { type: 'reveal'; initialVisibleCount: number; availableCount: number }

export function expansionReducer(
  state: ExpansionState,
  action: Action,
): ExpansionState {
  let changes: Partial<ExpansionState>
  switch (action.type) {
    case 'reset':
      changes = initialExpansionState(action.linesToShow)
      break
    case 'collapse':
      changes = {
        ...state,
        expanded: false,
        loading: false,
        error: false,
        visibleCount: action.linesToShow,
      }
      break
    case 'request':
      changes = { ...state, loading: true, error: false }
      break
    case 'failure':
      changes = { ...state, loading: false, error: true }
      break
    case 'unavailable':
      changes = { ...state, loading: false, unavailable: true }
      break
    case 'loaded':
      changes = {
        ...state,
        loading: false,
        loadedFragment: action.fragment,
        expanded: true,
        visibleCount: Math.min(
          action.initialVisibleCount + EXPANSION_BATCH_SIZE,
          action.availableCount,
        ),
      }
      break
    case 'reveal':
      changes = {
        ...state,
        expanded: true,
        visibleCount: Math.min(
          (state.expanded ? state.visibleCount : action.initialVisibleCount) +
            EXPANSION_BATCH_SIZE,
          action.availableCount,
        ),
      }
      break
  }
  return { ...state, ...changes }
}
