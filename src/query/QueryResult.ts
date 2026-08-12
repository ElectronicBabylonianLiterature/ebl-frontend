import { Fragment } from 'fragmentarium/domain/fragment'
import { TextId } from 'transliteration/domain/text-id'

export interface FragmentQueryPreviewToken {
  readonly type: string
  readonly value: string
  readonly cleanValue: string
  readonly uniqueLemma: readonly string[]
}

export interface FragmentQueryPreviewLine {
  readonly number: number
  readonly prefix: string
  readonly text: string
  readonly tokens: readonly FragmentQueryPreviewToken[]
}

export interface FragmentCardSummary {
  readonly type: 'FragmentCardSummary'
  readonly matchingLinePreview: readonly FragmentQueryPreviewLine[]
}

export interface UnsupportedFragmentCardSummary {
  readonly type: 'UnsupportedFragmentCardSummary'
}

export type QueryItemCardSummary =
  | FragmentCardSummary
  | UnsupportedFragmentCardSummary

export interface QueryItem {
  readonly museumNumber: string
  readonly matchingLines: readonly number[]
  readonly matchCount: number
  readonly fragment?: Fragment
  readonly thumbnailPath?: string | null
  readonly cardSummary?: QueryItemCardSummary
}

export interface QueryResult {
  readonly items: readonly QueryItem[]
  readonly matchCountTotal: number | null
  readonly isMatchCountTotalExact?: boolean
  readonly hasNextPage?: boolean | null
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
  matchCountTotal: number | null
  isMatchCountTotalExact?: boolean
  hasNextPage?: boolean | null
}

export interface FragmentAfoRegisterQueryItem {
  traditionalReference: string
  fragmentNumbers: readonly string[]
}

export interface FragmentAfoRegisterQueryResult {
  items: readonly FragmentAfoRegisterQueryItem[]
}
