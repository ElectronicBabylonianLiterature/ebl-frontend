import FragmentService from 'fragmentarium/application/FragmentService'
import { Fragment } from 'fragmentarium/domain/fragment'
import { QueryItem } from 'query/QueryResult'
import fragmentPreviewLookup from 'query/fragmentPreviewLookup'

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
  const { lines: initialLineIndexes, excludeLines } = fragmentPreviewLookup(
    queryItem.matchingLines,
    linesToShow,
  )
  return fragmentService
    .find(queryItem.museumNumber, initialLineIndexes, excludeLines)
    .then((fragment) => ({ fragment, initialLineIndexes }))
}
