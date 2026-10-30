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

function countVisibleTextLines(
  fragment: Fragment,
  linesToShow: number,
): number {
  return Math.min(
    linesToShow,
    fragment.text.lines.filter((line) => line.type === 'TextLine').length,
  )
}

function hasMoreMatches(queryItem: QueryItem, visibleCount: number): boolean {
  const hasMoreIndexes =
    takeUniqueMatchingLineIndexes(queryItem.matchingLines, visibleCount + 1)
      .length > visibleCount
  const hasMoreTotal =
    typeof queryItem.totalMatchingLines !== 'number' ||
    queryItem.totalMatchingLines > visibleCount
  return hasMoreIndexes && hasMoreTotal
}

function remainingMatches({
  expanded,
  loadedFragment,
  availableCount,
  visibleCount,
  totalMatchingLines,
  initialVisibleCount,
}: {
  expanded: boolean
  loadedFragment: Fragment | null
  availableCount: number
  visibleCount: number
  totalMatchingLines: number | null | undefined
  initialVisibleCount: number
}): number | null {
  if (expanded && loadedFragment) {
    return Math.max(availableCount - visibleCount, 0)
  }
  return typeof totalMatchingLines === 'number'
    ? Math.max(totalMatchingLines - initialVisibleCount, 0)
    : null
}

function nextVisibleCount(
  current: number,
  expanded: boolean,
  initialVisibleCount: number,
  availableCount: number,
): number {
  const startingCount = expanded ? current : initialVisibleCount
  return Math.min(startingCount + EXPANSION_BATCH_SIZE, availableCount)
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

  const initialVisibleCount = countVisibleTextLines(fragment, linesToShow)
  const canExpand =
    enableExpansion && hasMoreMatches(queryItem, initialVisibleCount)
  const selectedIndexes = loadedFragment
    ? textLineIndexes(loadedFragment, queryItem.matchingLines)
    : []
  const availableCount = selectedIndexes.length
  const remainingCount = remainingMatches({
    expanded,
    loadedFragment,
    availableCount,
    visibleCount,
    totalMatchingLines: queryItem.totalMatchingLines,
    initialVisibleCount,
  })

  function collapse(): void {
    requestVersion.current += 1
    setExpanded(false)
    setLoading(false)
    setError(false)
    setVisibleCount(linesToShow)
  }

  function revealLoadedFragment(): void {
    setExpanded(true)
    setVisibleCount((current) =>
      nextVisibleCount(current, expanded, initialVisibleCount, availableCount),
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
