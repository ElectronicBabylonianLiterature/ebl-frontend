import Bluebird from 'bluebird'
import Sign, { SignQuery } from 'signs/domain/Sign'
import SignRepository from 'signs/infrastructure/SignRepository'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import Promise from 'bluebird'

export default class SignService {
  private readonly signsRepository: SignRepository

  constructor(signsRepository: SignRepository) {
    this.signsRepository = signsRepository
  }

  getImages(signName: string): Promise<{ images: Blob[] }> {
    return this.signsRepository.getImages(signName)
  }

  associateSigns(
    tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
  ): Bluebird<ReadonlyArray<ReadonlyArray<AnnotationToken>>> {
    return this.signsRepository.associateSigns(tokens)
  }

  search(signQuery: SignQuery): Bluebird<Sign[]> {
    return this.signsRepository.search(signQuery)
  }
  find(signName: string): Bluebird<Sign> {
    return this.signsRepository.find(signName)
  }
}
