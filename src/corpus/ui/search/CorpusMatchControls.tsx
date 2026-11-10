import React, { useCallback, useEffect, useRef } from 'react'
import { Col, Row } from 'react-bootstrap'
import type { ChapterMatchState } from './useCorpusChapterMatches'

function useMatchControlRef(
  restoreFocus: React.MutableRefObject<boolean>,
): readonly [
  React.MutableRefObject<HTMLButtonElement | null>,
  React.RefCallback<HTMLButtonElement>,
] {
  const control = useRef<HTMLButtonElement | null>(null)
  const setControl = useCallback(
    (element: HTMLButtonElement | null): void => {
      if (element === null && control.current === document.activeElement) {
        restoreFocus.current = true
      }
      control.current = element
    },
    [restoreFocus],
  )
  return [control, setControl]
}

function useMatchControls(state: ChapterMatchState, initiallyVisible: number) {
  const { expanded, loading, loadedPairs, unavailable, remaining, collapse } =
    state
  const controls = useRef<HTMLDivElement>(null)
  const restoreFocus = useRef(false)
  const [primaryControl, setPrimaryControl] = useMatchControlRef(restoreFocus)
  const [, setSecondaryControl] = useMatchControlRef(restoreFocus)
  const canShowMore =
    (!expanded && loadedPairs > initiallyVisible) ||
    (!unavailable && (remaining > 0 || !expanded))
  const expandedOrLoading = expanded || loading

  useEffect(() => {
    if (restoreFocus.current) {
      ;(primaryControl.current ?? controls.current)?.focus()
      restoreFocus.current = false
    }
  }, [expanded, loading, primaryControl, unavailable])

  return {
    controls,
    setPrimaryControl,
    setSecondaryControl,
    canShowMore,
    showPrimaryControl: canShowMore || expandedOrLoading,
    showSecondaryControl: canShowMore && expandedOrLoading,
    collapseMatches: () => {
      restoreFocus.current = true
      collapse()
    },
  }
}

function moreLabel(state: ChapterMatchState, initiallyVisible: number): string {
  if (state.loading) return 'Loading chapter matches…'
  if (state.error) return 'Retry loading chapter matches'
  if (!state.expanded && state.loadedPairs > initiallyVisible)
    return 'Show loaded chapter matches'
  return `Show ${state.nextBatchSize} more match${state.nextBatchSize === 1 ? '' : 'es'}`
}

export default function CorpusMatchControls({
  state,
  initiallyVisible,
  matchesId,
  descriptionId,
}: {
  state: ChapterMatchState
  initiallyVisible: number
  matchesId: string
  descriptionId: string
}): JSX.Element {
  const {
    controls,
    setPrimaryControl,
    setSecondaryControl,
    canShowMore,
    showPrimaryControl,
    showSecondaryControl,
    collapseMatches,
  } = useMatchControls(state, initiallyVisible)
  const sharedButtonProps = {
    type: 'button' as const,
    className: 'btn btn-link p-0',
    'aria-expanded': state.expanded,
    'aria-controls': matchesId,
    'aria-describedby': descriptionId,
  }
  return (
    <Row>
      <Col
        ref={controls}
        className="corpus-search__match-controls"
        role="group"
        aria-label="Chapter match controls"
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        {showPrimaryControl && (
          <button
            {...sharedButtonProps}
            ref={setPrimaryControl}
            aria-disabled={state.loading}
            onClick={canShowMore ? state.showMore : collapseMatches}
          >
            {canShowMore
              ? moreLabel(state, initiallyVisible)
              : 'Collapse chapter matches'}
          </button>
        )}
        {showSecondaryControl && (
          <button
            {...sharedButtonProps}
            ref={setSecondaryControl}
            onClick={collapseMatches}
          >
            {state.loading ? 'Cancel loading' : 'Collapse chapter matches'}
          </button>
        )}
        {state.error && <p role="alert">Could not load chapter matches.</p>}
        {state.unavailable && (
          <p role="alert">Additional chapter matches are unavailable.</p>
        )}
      </Col>
    </Row>
  )
}
