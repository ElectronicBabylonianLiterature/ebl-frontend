import Promise from 'bluebird'
import { stringify } from 'query-string'
import { QueryResult } from './QueryResult'

export interface QueryProps {
  number?: string
  transliteration?: string
  bibliographyId?: string
  pages?: string
  lemma?: string
  lemmaAnd?: string
  lemmaOr?: string
  lemmaLine?: string
  lemmaPhrase?: string
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
