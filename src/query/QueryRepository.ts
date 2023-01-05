import Promise from 'bluebird'
import { stringify } from 'query-string'
import { QueryResult } from './QueryResult'

type QueryType = 'and' | 'or' | 'line' | 'phrase'

export type FragmentQuery = {
  lemmas: string
  'lemma-operator': QueryType
  limit: number
}

export interface QueryRepository {
  query(fragmentQuery: Partial<FragmentQuery>): Promise<QueryResult>
}

export class ApiQueryRepository {
  constructor(
    private readonly apiClient: {
      fetchJson: (url: string, authorize: boolean) => Promise<any>
    }
  ) {}

  query(fragmentQuery: Partial<FragmentQuery>): Promise<QueryResult> {
    return this.apiClient.fetchJson(
      `/fragments/query?${stringify(fragmentQuery)}`,
      true
    )
  }
}
