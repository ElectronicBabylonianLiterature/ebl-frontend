import { FragmentSearchCriteria } from 'query/FragmentQuery'
import {
  isMultilineTransliteration,
  isMultiLemmaPhrase,
} from 'query/queryShape'

export default function getLibraryCountUnit(
  fragmentQuery: FragmentSearchCriteria,
): 'matching passage' | 'matching occurrence' | 'matching line' {
  if (isMultilineTransliteration(fragmentQuery) && !fragmentQuery.lemmas) {
    return 'matching passage'
  }
  if (isMultiLemmaPhrase(fragmentQuery)) {
    return 'matching occurrence'
  }
  return 'matching line'
}
