import { useEffect, useRef, useState } from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
import { QueryItem } from 'query/QueryResult'
import takeUniqueMatchingLineIndexes from 'query/takeUniqueMatchingLineIndexes'

export const EXPANSION_BATCH_SIZE = 10

function textLineIndexes(
  fragment: Fragment,
  matchingLines: readonly number[],
): number[] {
  return takeUniqueMatchingLineIndexes(
    matchingLines,
    Number.MAX_SAFE_INTEGER,
  ).filter((index) => fragment.text.allLines[index]?.type === 'TextLine')
}

export default function useFragmentMatchExpansion({
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
}) {
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
    ? textLineIndexes(loadedFragment, queryItem.matchingLines)
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

  function revealLoadedFragment(): void {
    setExpanded(true)
    setVisibleCount(
      expanded
        ? (current) => Math.min(current + EXPANSION_BATCH_SIZE, availableCount)
        : Math.min(initialVisibleCount + EXPANSION_BATCH_SIZE, availableCount),
    )
  }

  function handleLoadedFragment(fullFragment: Fragment, version: number): void {
    if (version !== requestVersion.current) {
      return
    }
    const matchingCount = textLineIndexes(
      fullFragment,
      queryItem.matchingLines,
    ).length
    setLoading(false)
    if (matchingCount <= initialVisibleCount) {
      setUnavailable(true)
      return
    }
    setLoadedFragment(fullFragment)
    setExpanded(true)
    setVisibleCount(
      Math.min(initialVisibleCount + EXPANSION_BATCH_SIZE, matchingCount),
    )
  }

  function handleLoadError(version: number): void {
    if (version === requestVersion.current) {
      setLoading(false)
      setError(true)
    }
  }

  function requestFullFragment(): void {
    const version = ++requestVersion.current
    setLoading(true)
    setError(false)
    fragmentService.find(queryItem.museumNumber).then(
      (fullFragment) => handleLoadedFragment(fullFragment, version),
      () => handleLoadError(version),
    )
  }

  function showMore(): void {
    if (loading) {
      return
    }
    if (loadedFragment) {
      revealLoadedFragment()
    } else {
      requestFullFragment()
    }
  }

  return {
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
  }
}
