import Promise from 'bluebird'
import { QueryResult } from './QueryResult'
import { stringify } from 'query-string'

type QueryType = 'and' | 'or' | 'line' | 'phrase' | 'lemma'

export type QueryProps = {
  [key in QueryType]: string[]
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
