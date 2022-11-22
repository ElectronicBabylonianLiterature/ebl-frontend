import Bluebird from 'bluebird'
import { ApiQueryRepository } from './QueryRepository'
import { QueryResult } from './QueryResult'

export class QueryService {
  constructor(private readonly queryRepository: ApiQueryRepository) {}

  query(lemma: string): Bluebird<QueryResult> {
    return this.queryRepository.query({ lemma: [lemma] })
  }

  queryAnd(lemmas: string[]): Bluebird<QueryResult> {
    return this.queryRepository.query({ and: lemmas })
  }

  queryOr(lemmas: string[]): Bluebird<QueryResult> {
    return this.queryRepository.query({ or: lemmas })
  }

  queryLine(lemmas: string[]): Bluebird<QueryResult> {
    return this.queryRepository.query({ line: lemmas })
  }

  queryPhrase(lemmas: string[]): Bluebird<QueryResult> {
    return this.queryRepository.query({ phrase: lemmas })
  }
}
