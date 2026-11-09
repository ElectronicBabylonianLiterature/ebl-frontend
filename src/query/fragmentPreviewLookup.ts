import takeUniqueMatchingLineIndexes from 'query/takeUniqueMatchingLineIndexes'

export type FragmentPreviewLookup = {
  readonly lines: number[]
  readonly excludeLines: boolean
}

// The prefetch cache writer and the fragment readers must agree on these
// values, because together they form the fragment cache key.
export default function fragmentPreviewLookup(
  matchingLines: readonly number[],
  linesToShow: number,
): FragmentPreviewLookup {
  return {
    lines: takeUniqueMatchingLineIndexes(matchingLines, linesToShow),
    excludeLines: matchingLines.length === 0,
  }
}
