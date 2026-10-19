import { QueryType } from 'query/FragmentQuery'

export type CorpusQuery = Partial<{
  lemmas: string
  lemmaOperator: QueryType
  transliteration: string
}>
