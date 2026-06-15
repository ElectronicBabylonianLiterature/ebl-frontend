import { Fragment } from 'fragmentarium/domain/fragment'
import { TextId } from 'transliteration/domain/text-id'

export interface QueryItem {
  readonly museumNumber: string
  readonly matchingLines: readonly number[]
  readonly matchCount: number
  readonly fragment?: Fragment
  readonly thumbnailPath?: string | null
}

export interface QueryResult {
  readonly items: readonly QueryItem[]
  readonly matchCountTotal: number
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
