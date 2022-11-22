import Promise from 'bluebird'
import { QueryResult } from './QueryResult'
import { stringify } from 'query-string'

type QueryType = 'lemma' | 'and' | 'or' | 'line' | 'phrase'

export type QueryProps = {
  [key in QueryType]: string
}

export interface QueryRepository {
  query(queryProps: Partial<QueryProps>): Promise<QueryResult>
}

export class ApiQueryRepository {
  constructor(
    private readonly apiClient: {
      fetchJson: (url: string, authorize: boolean) => Promise<any>
    }
  ) {}

  query(queryProps: Partial<QueryProps>): Promise<QueryResult> {
    return this.apiClient.fetchJson(
      `/fragments/query?${stringify(queryProps)}`,
      true
    )
  }
}
