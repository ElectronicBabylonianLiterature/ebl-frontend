import Bluebird from 'bluebird'
import Sign, { OrderedSign, SignQuery, UnicodeAtf } from 'signs/domain/Sign'
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

  getCentroidImages(signName: string): Bluebird<CroppedAnnotation[]> {
    return this.signsRepository.getCentroidImages(signName)
  }

  getClusterVariants(
    signName: string,
    clusterId: string,
    script: string,
  ): Bluebird<CroppedAnnotation[]> {
    return this.signsRepository.getClusterVariants(signName, clusterId, script)
  }

  associateSigns(
    tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>,
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
    sortEra: string,
  ): Bluebird<[OrderedSign[]]> {
    return this.signsRepository.findSignsByOrder(signName, sortEra)
  }

  getUnicodeFromAtf(text: string): Bluebird<UnicodeAtf[]> {
    return this.signsRepository.getUnicodeFromAtf(text)
  }
}
