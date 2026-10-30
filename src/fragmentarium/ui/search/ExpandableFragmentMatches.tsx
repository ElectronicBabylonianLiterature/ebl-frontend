import React, { useEffect, useRef, useState } from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
import { QueryItem } from 'query/QueryResult'
import RenderFragmentLines from 'dictionary/ui/search/RenderFragmentLines'
import takeUniqueMatchingLineIndexes from 'query/takeUniqueMatchingLineIndexes'

const EXPANSION_BATCH_SIZE = 10

export default function ExpandableFragmentMatches({
  fragment,
  queryItem,
  queryLemmas,
  linesToShow,
  fragmentService,
  enableExpansion,
}: {
  fragment: Fragment
  queryItem: QueryItem
  queryLemmas?: readonly string[]
  linesToShow: number
  fragmentService: Pick<FragmentService, 'find'>
  enableExpansion: boolean
}): JSX.Element {
  const requestVersion = useRef(0)
  const [loadedFragment, setLoadedFragment] = useState<Fragment | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [visibleCount, setVisibleCount] = useState(linesToShow)
  const queryIdentity = `${queryItem.museumNumber}:${queryItem.matchingLines.join(
    ',',
  )}:${queryItem.matchCount}:${queryItem.totalMatchingLines}:${
    queryLemmas?.join(',') ?? ''
  }:${linesToShow}`

  useEffect(() => {
    requestVersion.current += 1
    setLoadedFragment(null)
    setExpanded(false)
    setLoading(false)
    setError(false)
    setUnavailable(false)
    setVisibleCount(linesToShow)
    return () => {
      requestVersion.current += 1
    }
  }, [queryIdentity, fragmentService, linesToShow])

  const initialVisibleCount = Math.min(
    linesToShow,
    fragment.text.lines.filter((line) => line.type === 'TextLine').length,
  )
  const hasAdditionalIndexes =
    takeUniqueMatchingLineIndexes(
      queryItem.matchingLines,
      initialVisibleCount + 1,
    ).length > initialVisibleCount
  const hasAdditionalTotal =
    typeof queryItem.totalMatchingLines !== 'number' ||
    queryItem.totalMatchingLines > initialVisibleCount
  const canExpand =
    enableExpansion && hasAdditionalIndexes && hasAdditionalTotal
  const selectedIndexes = loadedFragment
    ? takeUniqueMatchingLineIndexes(
        queryItem.matchingLines,
        Number.MAX_SAFE_INTEGER,
      ).filter(
        (index) => loadedFragment.text.allLines[index]?.type === 'TextLine',
      )
    : []
  const availableCount = selectedIndexes.length
  const remainingCount =
    expanded && loadedFragment
      ? Math.max(availableCount - visibleCount, 0)
      : typeof queryItem.totalMatchingLines === 'number'
        ? Math.max(queryItem.totalMatchingLines - initialVisibleCount, 0)
        : null

  function collapse(): void {
    requestVersion.current += 1
    setExpanded(false)
    setLoading(false)
    setError(false)
    setVisibleCount(linesToShow)
  }

  function showMore(): void {
    if (loading) {
      return
    }
    if (expanded && loadedFragment) {
      setVisibleCount((current) =>
        Math.min(current + EXPANSION_BATCH_SIZE, availableCount),
      )
      return
    }
    if (loadedFragment) {
      setExpanded(true)
      setVisibleCount(
        Math.min(initialVisibleCount + EXPANSION_BATCH_SIZE, availableCount),
      )
      return
    }

    const currentVersion = ++requestVersion.current
    setLoading(true)
    setError(false)
    fragmentService.find(queryItem.museumNumber).then(
      (fullFragment) => {
        if (currentVersion !== requestVersion.current) {
          return
        }
        const validMatchingIndexes = takeUniqueMatchingLineIndexes(
          queryItem.matchingLines,
          Number.MAX_SAFE_INTEGER,
        ).filter(
          (index) => fullFragment.text.allLines[index]?.type === 'TextLine',
        )
        if (validMatchingIndexes.length <= initialVisibleCount) {
          setUnavailable(true)
          setLoading(false)
          return
        }
        setLoadedFragment(fullFragment)
        setExpanded(true)
        setLoading(false)
        setVisibleCount(initialVisibleCount + EXPANSION_BATCH_SIZE)
      },
      () => {
        if (currentVersion !== requestVersion.current) {
          return
        }
        setLoading(false)
        setError(true)
      },
    )
  }

  const displayFragment = expanded && loadedFragment ? loadedFragment : fragment
  const showMoreButton =
    canExpand && !unavailable && (!expanded || remainingCount !== 0)
  const moreLabel = loading
    ? 'Loading matching lines…'
    : error
      ? 'Retry loading matching lines'
      : remainingCount === null
        ? 'Show more matching lines'
        : `Show ${remainingCount} more matching line${remainingCount === 1 ? '' : 's'}`

  return (
    <div aria-busy={loading}>
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
      {canExpand && (
        <div className="fragment-result__match-controls">
          {showMoreButton && (
            <button
              type="button"
              className="btn btn-link p-0"
              aria-expanded={expanded}
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
