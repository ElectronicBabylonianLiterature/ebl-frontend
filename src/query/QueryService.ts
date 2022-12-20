import Bluebird from 'bluebird'
import { QueryRepository } from './QueryRepository'
import { QueryResult } from './QueryResult'

export class QueryService {
  constructor(private readonly queryRepository: QueryRepository) {}

  query(lemma: string): Bluebird<QueryResult> {
    return this.queryRepository.query({ lemma: lemma })
  }

  queryAnd(lemmas: string[]): Bluebird<QueryResult> {
    return this.queryRepository.query({ and: lemmas.join('+') })
  }

  queryOr(lemmas: string[]): Bluebird<QueryResult> {
    return this.queryRepository.query({ or: lemmas.join('+') })
  }

  queryLine(lemmas: string[]): Bluebird<QueryResult> {
    return this.queryRepository.query({ line: lemmas.join('+') })
  }

  queryPhrase(lemmas: string[]): Bluebird<QueryResult> {
    return this.queryRepository.query({ phrase: lemmas.join('+') })
  }
}
