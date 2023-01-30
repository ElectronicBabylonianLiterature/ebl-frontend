import { QueryType } from './FragmentQuery'

export type CorpusQuery = Partial<{
  lemmas: string
  lemmaOperator: QueryType
  transliteration: string
}>
