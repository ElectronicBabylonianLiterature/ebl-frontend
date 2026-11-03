import { FragmentSearchCriteria } from 'query/FragmentQuery'

export default function getLibraryCountUnit(
  fragmentQuery: FragmentSearchCriteria,
): 'matching passage' | 'matching occurrence' | 'matching line' {
  return fragmentQuery.transliteration?.trim().includes('\n') &&
    !fragmentQuery.lemmas
    ? 'matching passage'
    : (fragmentQuery.lemmas?.split('+').length ?? 0) > 1 &&
        fragmentQuery.lemmaOperator === 'phrase' &&
        !fragmentQuery.transliteration
      ? 'matching occurrence'
      : 'matching line'
}
