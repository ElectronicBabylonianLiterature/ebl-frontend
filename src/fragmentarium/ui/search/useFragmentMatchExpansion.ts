import { useEffect, useRef, useReducer } from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
import { QueryItem } from 'query/QueryResult'
import takeUniqueMatchingLineIndexes from 'query/takeUniqueMatchingLineIndexes'
import AbortableOperation from 'common/utils/AbortableOperation'
import {
  getExpandedMatchIndexes,
  textLineIndexes,
} from 'fragmentarium/ui/search/fragmentMatchIndexes'

import {
  expansionReducer,
  initialExpansionState,
} from './fragmentMatchExpansionState'
export { EXPANSION_BATCH_SIZE } from './fragmentMatchExpansionState'

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

export default function useFragmentMatchExpansion({
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
}) {
  const requestVersion = useRef(0)
  const fullFragmentRequest = useRef(new AbortableOperation())
  const [state, dispatch] = useReducer(
    expansionReducer,
    linesToShow,
    initialExpansionState,
  )
  const {
    loadedFragment,
    expanded,
    loading,
    error,
    unavailable,
    visibleCount,
  } = state
  const queryIdentity = `${queryItem.museumNumber}:${queryItem.matchingLines.join(
    ',',
  )}:${queryItem.matchCount}:${queryItem.totalMatchingLines}:${
    queryLemmas?.join(',') ?? ''
  }:${linesToShow}`

  useEffect(() => {
    requestVersion.current += 1
    dispatch({ type: 'reset', linesToShow })
    const request = fullFragmentRequest.current
    return () => {
      requestVersion.current += 1
      request.abort()
    }
  }, [queryIdentity, fragmentService, linesToShow])

  const initialVisibleCount = countVisibleTextLines(fragment, linesToShow)
  const canExpand =
    enableExpansion && hasMoreMatches(queryItem, initialVisibleCount)
  const availableIndexes = loadedFragment
    ? textLineIndexes(loadedFragment, queryItem.matchingLines)
    : []
  const availableCount = availableIndexes.length
  const selectedIndexes = getExpandedMatchIndexes(
    fragment,
    availableIndexes,
    linesToShow,
    visibleCount,
    initialLineIndexes,
  )
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
    fullFragmentRequest.current.abort()
    dispatch({ type: 'collapse', linesToShow })
  }

  function revealLoadedFragment(): void {
    dispatch({ type: 'reveal', initialVisibleCount, availableCount })
  }

  function handleLoadedFragment(fullFragment: Fragment, version: number): void {
    if (version !== requestVersion.current) {
      return
    }
    const matchingCount = textLineIndexes(
      fullFragment,
      queryItem.matchingLines,
    ).length
    dispatch(
      matchingCount <= initialVisibleCount
        ? { type: 'unavailable' }
        : {
            type: 'loaded',
            fragment: fullFragment,
            initialVisibleCount,
            availableCount: matchingCount,
          },
    )
  }

  function handleLoadError(version: number): void {
    if (version === requestVersion.current) {
      dispatch({ type: 'failure' })
    }
  }

  function requestFullFragment(): void {
    const version = ++requestVersion.current
    dispatch({ type: 'request' })
    fragmentService
      .find(
        queryItem.museumNumber,
        undefined,
        undefined,
        fullFragmentRequest.current.start(),
      )
      .then(
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
