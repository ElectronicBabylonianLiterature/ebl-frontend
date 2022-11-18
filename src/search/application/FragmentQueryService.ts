import Bluebird from 'bluebird'
import { ApiQueryRepository } from 'search/infrastructure/QueryRepository'
import { QueryResult } from 'search/infrastructure/QueryResult'

export class FragmentQueryService {
  constructor(private readonly queryRepository: ApiQueryRepository) {}

  query(lemma: string): Bluebird<QueryResult> {
    return this.queryRepository.query(lemma)
  }

  queryPhrase(lemmas: string[]): Bluebird<QueryResult> {
    return this.queryRepository.queryPhrase(lemmas)
  }
}
