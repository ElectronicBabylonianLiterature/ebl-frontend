import Sign, {
  MesZlKap2Entry,
  OrderedSign,
  SignQuery,
  UnicodeAtf,
} from 'signs/domain/Sign'
import SignRepository from 'signs/infrastructure/SignRepository'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'

import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'

export default class SignService {
  private readonly signsRepository: SignRepository

  constructor(signsRepository: SignRepository) {
    this.signsRepository = signsRepository
  }

  getCentroidImages(
    signName: string,
    signal?: AbortSignal,
  ): Promise<CroppedAnnotation[]> {
    return this.signsRepository.getCentroidImages(signName, signal)
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
    signal?: AbortSignal,
  ): Promise<ReadonlyArray<ReadonlyArray<AnnotationToken>>> {
    return this.signsRepository.associateSigns(tokens, signal)
  }

  search(signQuery: SignQuery, signal?: AbortSignal): Promise<Sign[]> {
    return this.signsRepository.search(signQuery, signal)
  }

  find(signName: string, signal?: AbortSignal): Promise<Sign> {
    return this.signsRepository.find(signName, signal)
  }

  findMesZlKap2(
    signName: string,
    signal?: AbortSignal,
  ): Promise<MesZlKap2Entry[]> {
    return this.signsRepository.findMesZlKap2(signName, signal)
  }

  listAllSigns(): Promise<string[]> {
    return this.signsRepository.listAllSigns()
  }

  findSignsByOrder(
    signName: string,
    sortEra: string,
    signal?: AbortSignal,
  ): Promise<OrderedSign[][]> {
    return this.signsRepository.findSignsByOrder(signName, sortEra, signal)
  }

  getUnicodeFromAtf(text: string, signal?: AbortSignal): Promise<UnicodeAtf[]> {
    return this.signsRepository.getUnicodeFromAtf(text, signal)
  }
}
