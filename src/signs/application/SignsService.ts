import Promise from 'bluebird'

class SignsService {
  private readonly signsRepository

  constructor(signsRepository) {
    this.signsRepository = signsRepository
  }
  search(query): Promise<any[]> {
    return this.signsRepository.search(query.query)
  }
}

export default SignsService
