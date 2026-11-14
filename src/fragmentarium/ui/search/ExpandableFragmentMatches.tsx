import React, { useId } from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import FragmentService from 'fragmentarium/application/FragmentService'
import { QueryItem } from 'query/QueryResult'
import RenderFragmentLines from 'dictionary/ui/search/RenderFragmentLines'
import useFragmentMatchExpansion from 'fragmentarium/ui/search/useFragmentMatchExpansion'
import FragmentMatchControls from './FragmentMatchControls'

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
  const matchesId = useId()
  const expansion = useFragmentMatchExpansion({
    fragment,
    initialLineIndexes,
    queryItem,
    queryLemmas,
    linesToShow,
    fragmentService,
    enableExpansion,
  })
  const {
    expanded,
    loadedFragment,
    visibleCount,
    selectedIndexes,
    canExpand,
    loading,
  } = expansion
  const displayFragment = expanded && loadedFragment ? loadedFragment : fragment

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
          remainderNoun={enableExpansion ? 'matching line' : 'line'}
          matchingLineIndexes={queryItem.matchingLines}
          lemmaIds={queryLemmas}
        />
      </div>
      {canExpand && (
        <FragmentMatchControls
          expansion={expansion}
          museumNumber={queryItem.museumNumber}
          matchesId={matchesId}
        />
      )}
    </div>
  )
}
