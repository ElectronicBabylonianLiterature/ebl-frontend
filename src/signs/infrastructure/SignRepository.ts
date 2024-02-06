import ApiClient from 'http/ApiClient'
import Promise from 'bluebird'
import Sign, { SignQuery } from 'signs/domain/Sign'
import { stringify } from 'query-string'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import { AnnotationTokenType } from 'fragmentarium/domain/annotation'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'
import _ from 'lodash'
import { MesopotamianDate } from 'chronology/domain/Date'
import KingsService from 'chronology/application/KingsService'

class SignRepository {
  private readonly apiClient
  readonly kingsService

  constructor(apiClient: ApiClient, kingsService: KingsService) {
    this.apiClient = apiClient
    this.kingsService = kingsService
  }

  private handleEmptySignSearchResults(
    token: AnnotationToken,
    signSearchResults: Sign[]
  ) {
    const isValidResult = signSearchResults.length > 0
    if (token.type === AnnotationTokenType.HasSign && !isValidResult) {
      throw Error(
        `Reading '${token.name}' with subIndex '${token.subIndex}' has no corresponding Sign.`
      )
    } else {
      return isValidResult ? token.attachSign(signSearchResults[0]) : token
    }
  }

  private attachSignToToken(
    token: AnnotationToken
  ): Promise<AnnotationToken> | AnnotationToken {
    if (token.couldCorrespondingSignExist() && !token.hasSign) {
      return this.search({
        value: token.name.toLowerCase(),
        subIndex: token.subIndex as number,
      }).then((results) => this.handleEmptySignSearchResults(token, results))
    }
    return token
  }

  associateSigns(
    tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
  ): Promise<ReadonlyArray<ReadonlyArray<AnnotationToken>>> {
    const tokensWithSigns = tokens.map((tokensRow) =>
      tokensRow.map((token) => this.attachSignToToken(token))
    )
    return Promise.all(tokensWithSigns.map((token) => Promise.all(token)))
  }

  getImages(signName: string): Promise<CroppedAnnotation[]> {
    return this.apiClient
      .fetchJson(`/signs/${encodeURIComponent(signName)}/images`, false)
      .then((croppedAnnotations) => {
        return croppedAnnotations.map((croppedAnnotation) => {
          if (!_.isEmpty(croppedAnnotation.date)) {
            croppedAnnotation.date = MesopotamianDate.fromJson(
              croppedAnnotation.date,
              this.kingsService
            )
          } else {
            croppedAnnotation.date = undefined
          }
          return croppedAnnotation
        })
      })
  }

  search(signQuery: SignQuery): Promise<Sign[]> {
    return this.apiClient
      .fetchJson(`/signs?${stringify(signQuery)}`, false)
      .then((signDtos) => signDtos.map((signDto) => Sign.fromDto(signDto)))
  }
  find(signName: string): Promise<Sign> {
    return this.apiClient
      .fetchJson(`/signs/${encodeURIComponent(signName)}`, false)
      .then(Sign.fromDto)
  }
  listAllSigns(): Promise<string[]> {
    return this.apiClient.fetchJson(`/signs/all`, false)
  }
}

export default SignRepository
