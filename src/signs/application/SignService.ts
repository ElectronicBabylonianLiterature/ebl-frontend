import Bluebird from 'bluebird'
import Sign, { SignQuery } from 'signs/domain/Sign'
import SignRepository from 'signs/infrastructure/SignRepository'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'

import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'

export default class SignService {
  private readonly signsRepository: SignRepository

  constructor(signsRepository: SignRepository) {
    this.signsRepository = signsRepository
  }

  getImages(signName: string): Bluebird<CroppedAnnotation[]> {
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

  listAllSigns(): Bluebird<string[]> {
    return this.signsRepository.listAllSigns()
  }
  findSignsByOrder(
    signName: string,
    order: string,
    sortEra: string
  ): Bluebird<any[]> {
    return this.signsRepository.findSignsByOrder(signName, order, sortEra)
  }
}
