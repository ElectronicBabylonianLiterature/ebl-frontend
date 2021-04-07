import Promise from 'bluebird'
import Sign from 'signs/domain/Sign'

class SignsService {
  private readonly signsRepository

  constructor(signsRepository) {
    this.signsRepository = signsRepository
  }
  search(query): Promise<Sign> {
    return this.signsRepository.search(query.query)
  }
}

export default SignsService
