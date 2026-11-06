import React, { useId, useLayoutEffect, useRef } from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
import { QueryItem } from 'query/QueryResult'
import RenderFragmentLines from 'dictionary/ui/search/RenderFragmentLines'
import useFragmentMatchExpansion, {
  EXPANSION_BATCH_SIZE,
} from 'fragmentarium/ui/search/useFragmentMatchExpansion'

export default function ExpandableFragmentMatches({
  fragment,
  initialLineIndexes,
  queryItem,
  queryLemmas,
  linesToShow,
  fragmentService,
  enableExpansion,
}: {
  fragment: Fragment
  initialLineIndexes?: readonly number[]
  queryItem: QueryItem
  queryLemmas?: readonly string[]
  linesToShow: number
  fragmentService: Pick<FragmentService, 'find'>
  enableExpansion: boolean
}): JSX.Element {
  const cardDescriptionId = useId()
  const matchesId = useId()
  const controlsRef = useRef<HTMLDivElement>(null)
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const collapseButtonRef = useRef<HTMLButtonElement>(null)
  const controlsHadFocus = useRef(false)
  const {
    loadedFragment,
    expanded,
    loading,
    error,
    unavailable,
    visibleCount,
    canExpand,
    selectedIndexes,
    remainingCount,
    collapse,
    showMore,
  } = useFragmentMatchExpansion({
    fragment,
    initialLineIndexes,
    queryItem,
    queryLemmas,
    linesToShow,
    fragmentService,
    enableExpansion,
  })
  const displayFragment = expanded && loadedFragment ? loadedFragment : fragment
  const showMoreButton =
    canExpand && !unavailable && (!expanded || remainingCount !== 0)
  const nextBatchCount =
    remainingCount === null
      ? null
      : Math.min(remainingCount, EXPANSION_BATCH_SIZE)
  const moreLabel = loading
    ? 'Loading matching lines…'
    : error
      ? 'Retry loading matching lines'
      : nextBatchCount === null
        ? 'Show more matching lines'
        : `Show ${nextBatchCount} more matching line${nextBatchCount === 1 ? '' : 's'}`

  useLayoutEffect(() => {
    if (controlsHadFocus.current && document.activeElement === document.body) {
      const control =
        expanded || loading ? collapseButtonRef.current : moreButtonRef.current
      const focusTarget = control ?? controlsRef.current
      focusTarget?.focus()
    }
  })

  return (
    <div aria-busy={loading}>
      <div id={matchesId}>
        <RenderFragmentLines
          fragment={displayFragment}
          linesToShow={expanded ? visibleCount : linesToShow}
          selectedLineIndexes={expanded ? selectedIndexes : undefined}
          hideRemainingMessage={canExpand}
          totalMatchingLines={queryItem.totalMatchingLines}
          totalLines={enableExpansion ? undefined : queryItem.matchCount}
          matchingLineIndexes={queryItem.matchingLines}
          lemmaIds={queryLemmas}
        />
      </div>
      {canExpand && (
        <div
          className="fragment-result__match-controls"
          ref={controlsRef}
          role="group"
          aria-labelledby={cardDescriptionId}
          tabIndex={-1}
          onFocusCapture={() => {
            controlsHadFocus.current = true
          }}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              controlsHadFocus.current = false
            }
          }}
        >
          <span id={cardDescriptionId} className="visually-hidden">
            Matching lines in {queryItem.museumNumber}
          </span>
          {showMoreButton && (
            <button
              type="button"
              className="btn btn-link p-0"
              aria-expanded={expanded}
              aria-controls={matchesId}
              aria-describedby={cardDescriptionId}
              ref={moreButtonRef}
              disabled={loading}
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
              ref={collapseButtonRef}
              onClick={collapse}
            >
              {loading ? 'Cancel loading' : 'Collapse matching lines'}
            </button>
          )}
          {error && <p role="alert">Could not load matching lines.</p>}
          {unavailable && (
            <p role="alert">Additional matching lines are unavailable.</p>
          )}
        </div>
      )}
    </div>
  )
}
