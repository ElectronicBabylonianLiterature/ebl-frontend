import takeUniqueMatchingLineIndexes from 'query/takeUniqueMatchingLineIndexes'

export type FragmentPreviewLookup = {
  readonly lines: number[]
  readonly excludeLines: boolean
}

export default function fragmentPreviewLookup(
  matchingLines: readonly number[],
  linesToShow: number,
): FragmentPreviewLookup {
  return {
    lines: takeUniqueMatchingLineIndexes(matchingLines, linesToShow),
    excludeLines: matchingLines.length === 0,
  }
}
