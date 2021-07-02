import Bluebird from 'bluebird'
import Sign, { SignQuery } from 'signs/domain/Sign'
import SignRepository from 'signs/infrastructure/SignRepository'

export default class SignService {
  private readonly signsRepository: SignRepository

  constructor(signsRepository: SignRepository) {
    this.signsRepository = signsRepository
  }

  search(signQuery: SignQuery): Bluebird<Sign[]> {
    return this.signsRepository.search(signQuery)
  }
  find(signName: string): Bluebird<Sign> {
    return this.signsRepository.find(signName)
  }
}
