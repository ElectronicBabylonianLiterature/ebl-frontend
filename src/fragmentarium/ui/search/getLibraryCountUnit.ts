import { FragmentSearchCriteria } from 'query/FragmentQuery'

export default function getLibraryCountUnit(
  fragmentQuery: FragmentSearchCriteria,
): 'matching passage' | 'matching occurrence' | 'matching line' {
  const { lemmas, lemmaOperator, transliteration } = fragmentQuery
  if (transliteration?.trim().includes('\n') && !lemmas) {
    return 'matching passage'
  }
  const isMultiLemmaPhrase =
    (lemmas?.split('+').length ?? 0) > 1 && lemmaOperator === 'phrase'
  if (isMultiLemmaPhrase && !transliteration) {
    return 'matching occurrence'
  }
  return 'matching line'
}
