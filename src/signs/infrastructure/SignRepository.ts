import ApiClient from 'http/ApiClient'
import Sign, {
  OrderedSign,
  SignDto,
  SignQuery,
  UnicodeAtf,
} from 'signs/domain/Sign'
import { stringify } from 'query-string'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import { AnnotationTokenType } from 'fragmentarium/domain/annotation'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import _ from 'lodash'
import { MesopotamianDate } from 'chronology/domain/Date'

class SignRepository {
  private readonly apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  private handleEmptySignSearchResults(
    token: AnnotationToken,
    signSearchResults: Sign[],
  ) {
    const isValidResult = signSearchResults.length > 0
    if (token.type === AnnotationTokenType.HasSign && !isValidResult) {
      throw Error(
        `Reading '${token.name}' with subIndex '${token.subIndex}' has no corresponding Sign.`,
      )
    } else {
      return isValidResult ? token.attachSign(signSearchResults[0]) : token
    }
  }

  private attachSignToToken(
    token: AnnotationToken,
    signal?: AbortSignal,
  ): Promise<AnnotationToken> | AnnotationToken {
    if (token.couldCorrespondingSignExist() && !token.hasSign) {
      return this.search(
        {
          value: token.name.toLowerCase(),
          subIndex: token.subIndex as number,
        },
        signal,
      ).then((results) => this.handleEmptySignSearchResults(token, results))
    }
    return token
  }

  private processCroppedAnnotations = (
    croppedAnnotations: CroppedAnnotation[],
  ): CroppedAnnotation[] => {
    return croppedAnnotations.map((croppedAnnotation) => {
      if (!_.isEmpty(croppedAnnotation.date)) {
        croppedAnnotation.date = MesopotamianDate.fromJson(
          croppedAnnotation.date,
        )
      } else {
        croppedAnnotation.date = undefined
      }
      return croppedAnnotation
    })
  }

  associateSigns(
    tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>,
    signal?: AbortSignal,
  ): Promise<ReadonlyArray<ReadonlyArray<AnnotationToken>>> {
    const tokensWithSigns = tokens.map((tokensRow) =>
      tokensRow.map((token) => this.attachSignToToken(token, signal)),
    )
    return Promise.all(tokensWithSigns.map((token) => Promise.all(token)))
  }

  getCentroidImages(
    signName: string,
    signal?: AbortSignal,
  ): Promise<CroppedAnnotation[]> {
    return this.apiClient
      .fetchJson<
        CroppedAnnotation[]
      >(`/signs/${encodeURIComponent(signName)}/images?centroids_only=true&include_unclustered=true`, false, signal)
      .then(this.processCroppedAnnotations)
  }

  getClusterVariants(
    signName: string,
    clusterId: string,
    script: string,
  ): Promise<CroppedAnnotation[]> {
    return this.apiClient
      .fetchJson<
        CroppedAnnotation[]
      >(`/signs/${encodeURIComponent(signName)}/images/cluster/${encodeURIComponent(clusterId)}?script=${encodeURIComponent(script)}`, false)
      .then(this.processCroppedAnnotations)
  }

  search(signQuery: SignQuery, signal?: AbortSignal): Promise<Sign[]> {
    return this.apiClient
      .fetchJson<SignDto[]>(`/signs?${stringify(signQuery)}`, false, signal)
      .then((signDtos) => signDtos.map((signDto) => Sign.fromDto(signDto)))
  }

  find(signName: string, signal?: AbortSignal): Promise<Sign> {
    return this.apiClient
      .fetchJson<SignDto>(
        `/signs/${encodeURIComponent(signName)}`,
        false,
        signal,
      )
      .then(Sign.fromDto)
  }

  listAllSigns(): Promise<string[]> {
    return this.apiClient.fetchJson(`/signs/all`, false)
  }

  findSignsByOrder(
    signName: string,
    sortEra: string,
    signal?: AbortSignal,
  ): Promise<[OrderedSign[]]> {
    return this.apiClient.fetchJson(
      `/signs/${encodeURIComponent(signName)}/${sortEra}`,
      false,
      signal,
    )
  }

  getUnicodeFromAtf(text: string, signal?: AbortSignal): Promise<UnicodeAtf[]> {
    return this.apiClient.fetchJson(
      `/signs/transliteration/${encodeURIComponent(text)}`,
      false,
      signal,
    )
  }
}

export default SignRepository
