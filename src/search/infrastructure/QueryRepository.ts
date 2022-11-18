import Promise from 'bluebird'
import { QueryResult } from './QueryResult'
import { stringify } from 'query-string'
import { Fragment } from 'fragmentarium/domain/fragment'
import MuseumNumber, {
  museumNumberToString,
} from 'fragmentarium/domain/MuseumNumber'
import { createFragment } from 'fragmentarium/infrastructure/FragmentRepository'

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

  queryPhrase(lemmas: readonly string[]): Promise<QueryResult> {
    return this.apiClient.fetchJson(
      `/fragments/query?${stringify({ phrase: lemmas.join('+') })}`,
      true
    )
  }

  getPartialFragment(number: MuseumNumber, lines: number[]): Promise<Fragment> {
    return this.apiClient
      .fetchJson(
        `/fragments/${museumNumberToString(number)}?${stringify({
          lines: lines,
        })}`,
        true
      )
      .then(createFragment)
  }
}
