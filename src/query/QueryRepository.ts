import Promise from 'bluebird'
import { stringify } from 'query-string'
import { QueryResult } from './QueryResult'

type QueryType = 'and' | 'or' | 'line' | 'phrase'

export type FragmentQuery = Partial<{
  lemmas: string
  lemmaOperator: QueryType
  limit: number
  number: string
  pages: string
  transliteration: string
  bibId: string
  title: string
  author: string
  bibYear: string
}>

export interface QueryRepository {
  query(fragmentQuery: FragmentQuery): Promise<QueryResult>
}

export class ApiQueryRepository {
  constructor(
    private readonly apiClient: {
      fetchJson: (url: string, authorize: boolean) => Promise<any>
    }
  ) {}

  query(fragmentQuery: FragmentQuery): Promise<QueryResult> {
    return this.apiClient.fetchJson(
      `/fragments/query?${stringify(fragmentQuery)}`,
      true
    )
  }
}
