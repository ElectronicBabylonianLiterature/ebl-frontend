import Bluebird from 'bluebird'
import { FragmentQuery, QueryRepository } from './QueryRepository'
import { QueryResult } from './QueryResult'

export class QueryService {
  constructor(private readonly queryRepository: QueryRepository) {}

  query(fragmentQuery: FragmentQuery): Bluebird<QueryResult> {
    return this.queryRepository.query(fragmentQuery)
  }
}
