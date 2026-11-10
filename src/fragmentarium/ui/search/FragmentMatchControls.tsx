import React, { useId } from 'react'
import useMatchControlFocus from './useMatchControlFocus'
import useFragmentMatchExpansion, {
  EXPANSION_BATCH_SIZE,
} from './useFragmentMatchExpansion'

function MatchStatus({
  error,
  unavailable,
}: {
  error: boolean
  unavailable: boolean
}): JSX.Element {
  return (
    <>
      {error && <p role="alert">Could not load matching lines.</p>}
      {unavailable && (
        <p role="alert">Additional matching lines are unavailable.</p>
      )}
    </>
  )
}

function moreMatchesLabel(
  loading: boolean,
  error: boolean,
  nextBatchCount: number | null,
): string {
  return loading
    ? 'Loading matching lines…'
    : error
      ? 'Retry loading matching lines'
      : nextBatchCount === null
        ? 'Show more matching lines'
        : `Show ${nextBatchCount} more matching line${nextBatchCount === 1 ? '' : 's'}`
}

export default function FragmentMatchControls({
  expansion,
  museumNumber,
  matchesId,
}: {
  expansion: ReturnType<typeof useFragmentMatchExpansion>
  museumNumber: string
  matchesId: string
}): JSX.Element {
  const cardDescriptionId = useId()
  const {
    expanded,
    loading,
    error,
    unavailable,
    remainingCount,
    canExpand,
    showMore,
    collapse,
  } = expansion
  const controls = useMatchControlFocus(expanded, loading)
  const showMoreButton =
    canExpand && !unavailable && (!expanded || remainingCount !== 0)
  const nextBatchCount =
    remainingCount === null
      ? null
      : Math.min(remainingCount, EXPANSION_BATCH_SIZE)
  const moreLabel = moreMatchesLabel(loading, error, nextBatchCount)

  return (
    <div
      className="fragment-result__match-controls"
      ref={controls.controlsRef}
      role="group"
      aria-labelledby={cardDescriptionId}
      tabIndex={-1}
      onFocusCapture={controls.onFocusCapture}
      onBlurCapture={controls.onBlurCapture}
    >
      <span id={cardDescriptionId} className="visually-hidden">
        Matching lines in {museumNumber}
      </span>
      {showMoreButton && (
        <button
          type="button"
          className="btn btn-link p-0"
          aria-expanded={expanded}
          aria-controls={matchesId}
          aria-describedby={cardDescriptionId}
          ref={controls.moreButtonRef}
          aria-disabled={loading}
          onClick={showMore}
        >
          {moreLabel}
        </button>
      )}
      {(expanded || loading) && (
        <button
          type="button"
          className="btn btn-link p-0"
          aria-expanded={expanded}
          aria-controls={matchesId}
          aria-describedby={cardDescriptionId}
          ref={controls.collapseButtonRef}
          onClick={collapse}
        >
          {loading ? 'Cancel loading' : 'Collapse matching lines'}
        </button>
      )}
      <MatchStatus error={error} unavailable={unavailable} />
    </div>
  )
}
