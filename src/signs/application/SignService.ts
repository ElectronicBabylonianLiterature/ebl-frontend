import Sign, { OrderedSign, SignQuery, UnicodeAtf } from 'signs/domain/Sign'
import SignRepository from 'signs/infrastructure/SignRepository'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'

import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'

export default class SignService {
  private readonly signsRepository: SignRepository

  constructor(signsRepository: SignRepository) {
    this.signsRepository = signsRepository
  }

  getCentroidImages(signName: string): Promise<CroppedAnnotation[]> {
    return this.signsRepository.getCentroidImages(signName)
  }

  getClusterVariants(
    signName: string,
    clusterId: string,
    script: string,
  ): Promise<CroppedAnnotation[]> {
    return this.signsRepository.getClusterVariants(signName, clusterId, script)
  }

  associateSigns(
    tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>,
  ): Promise<ReadonlyArray<ReadonlyArray<AnnotationToken>>> {
    return this.signsRepository.associateSigns(tokens)
  }

  search(signQuery: SignQuery): Promise<Sign[]> {
    return this.signsRepository.search(signQuery)
  }

  find(signName: string): Promise<Sign> {
    return this.signsRepository.find(signName)
  }

  listAllSigns(): Promise<string[]> {
    return this.signsRepository.listAllSigns()
  }

  findSignsByOrder(
    signName: string,
    sortEra: string,
  ): Promise<[OrderedSign[]]> {
    return this.signsRepository.findSignsByOrder(signName, sortEra)
  }

  getUnicodeFromAtf(text: string): Promise<UnicodeAtf[]> {
    return this.signsRepository.getUnicodeFromAtf(text)
  }
}
