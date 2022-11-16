import Promise from 'bluebird'
import { QueryResult } from './QueryResult'
import { stringify } from 'query-string'

export class ApiQueryRepository {
  constructor(
    private readonly apiClient: {
      fetchJson: (url: string, authorize: boolean) => Promise<any>
    }
  ) {}

  query(lemma: string): Promise<QueryResult> {
    return this.apiClient.fetchJson(
      `/fragments/query?${stringify({ lemma: lemma })}`,
      true
    )
  }
}
