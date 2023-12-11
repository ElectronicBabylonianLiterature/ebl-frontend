import { TextId } from 'transliteration/domain/text-id'

export interface QueryItem {
  museumNumber: string
  matchingLines: readonly number[]
  matchCount: number
}

export interface QueryResult {
  items: readonly QueryItem[]
  matchCountTotal: number
}

export interface CorpusQueryItem {
  textId: TextId
  lines: readonly number[]
  variants: readonly number[]
  name: string
  stage: string
  matchCount: number
}

export interface CorpusQueryResult {
  items: readonly CorpusQueryItem[]
  matchCountTotal: number
}

export interface FragmentAfoRegisterQueryItem {
  traditionalReference: string
  fragmentNumbers: readonly string[]
}

export interface FragmentAfoRegisterQueryResult {
  items: readonly FragmentAfoRegisterQueryItem[]
}
