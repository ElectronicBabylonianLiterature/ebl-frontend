import Promise from 'bluebird'
import Sign, { SignQuery } from 'signs/domain/Sign'
import SignsRepository from 'signs/infrastructure/SignsRepository'

class SignsService {
  private readonly signsRepository: SignsRepository

  constructor(signsRepository) {
    this.signsRepository = signsRepository
  }
  search(signQuery: SignQuery): Promise<readonly Sign[]> {
    return this.signsRepository.search(signQuery)
  }
}

export default SignsService
