import Bluebird from 'bluebird'
import { QueryRepository } from './QueryRepository'
import { QueryResult } from './QueryResult'

export class QueryService {
  constructor(private readonly queryRepository: QueryRepository) {}

  query(lemma: string): Bluebird<QueryResult> {
    return this.queryRepository.query({ lemma: lemma })
  }

  queryAnd(lemmas: string[]): Bluebird<QueryResult> {
    return this.queryRepository.query({ lemmaAnd: lemmas.join('+') })
  }

  queryOr(lemmas: string[]): Bluebird<QueryResult> {
    return this.queryRepository.query({ lemmaOr: lemmas.join('+') })
  }

  queryLine(lemmas: string[]): Bluebird<QueryResult> {
    return this.queryRepository.query({ lemmaLine: lemmas.join('+') })
  }

  queryPhrase(lemmas: string[]): Bluebird<QueryResult> {
    return this.queryRepository.query({ lemmaPhrase: lemmas.join('+') })
  }
}
