import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { QueryItem } from 'query/QueryResult'
import takeUniqueMatchingLineIndexes from 'query/takeUniqueMatchingLineIndexes'

export type FragmentMatchPreview = {
  fragment: Fragment
  initialLineIndexes: readonly number[]
}

export default function loadFragmentMatchPreview({
  fragmentService,
  queryItem,
  linesToShow,
}: {
  fragmentService: Pick<FragmentService, 'find'>
  queryItem: QueryItem
  linesToShow: number
}): Promise<FragmentMatchPreview> {
  const initialLineIndexes = takeUniqueMatchingLineIndexes(
    queryItem.matchingLines,
    linesToShow,
  )
  return fragmentService
    .find(
      queryItem.museumNumber,
      initialLineIndexes,
      queryItem.matchingLines.length === 0,
    )
    .then((fragment) => ({ fragment, initialLineIndexes }))
}
