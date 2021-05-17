import Bluebird from 'bluebird'
import Sign, { SignQuery } from 'signs/domain/Sign'
import SignsRepository from 'signs/infrastructure/SignsRepository'

export default class SignsService {
  private readonly signsRepository: SignsRepository

  constructor(signsRepository: SignsRepository) {
    this.signsRepository = signsRepository
  }

  search(signQuery: SignQuery): Bluebird<Sign[]> {
    return this.signsRepository.search(signQuery)
  }
}
