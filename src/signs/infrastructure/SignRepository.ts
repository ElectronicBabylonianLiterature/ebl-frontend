import ApiClient from 'http/ApiClient'
import Promise from 'bluebird'
import Sign, { SignQuery } from 'signs/domain/Sign'
import { stringify } from 'query-string'
import { AnnotationToken } from 'fragmentarium/ui/image-annotation/annotation-tool/annotation-token'
import { AnnotationTokenType } from 'fragmentarium/domain/annotation'

class SignRepository {
  private readonly apiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  associateSigns(
    tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
  ): Promise<[ReadonlyArray<ReadonlyArray<AnnotationToken>>, string[]]> {
    const tokensWithSigns = tokens.map((tokensRow) =>
      tokensRow.map((token) => {
        if (token.type === AnnotationTokenType.HasSign) {
          return this.search({
            value: token.name,
            subIndex: token.subIndex ?? undefined,
          }).then((results) => {
            const annotationToken = new AnnotationToken(
              token.value,
              token.type,
              token.displayValue,
              token.path,
              token.enabled,
              results.length > 0 ? results[0] : null
            )
            return results.length > 0
              ? annotationToken
              : Promise.reject({
                  annotationToken: annotationToken,
                  error: `Reading '${token.name}' with subIndex '${token.subIndex}' has no corresponding Sign. Please notfiy eBL.`,
                })
          })
        } else {
          return Promise.resolve(token)
        }
      })
    )
    const errors: string[] = []
    const annotationTokens = Promise.all(
      tokensWithSigns.map((promises) =>
        Promise.all(promises.map((promise) => promise.reflect())).map(
          (inspection) => {
            if (!inspection.isFulfilled()) {
              const result = inspection.reason()
              errors.push(result.error)
              return result.annotationToken
            } else {
              return inspection.value()
            }
          }
        )
      )
    )
    return Promise.all([annotationTokens, errors])
  }

  search(signQuery: SignQuery): Promise<Sign[]> {
    return this.apiClient
      .fetchJson(`/signs?${stringify(signQuery)}`, true)
      .then((signDtos) => signDtos.map((signDto) => Sign.fromDto(signDto)))
  }
  find(signName: string): Promise<Sign> {
    return this.apiClient
      .fetchJson(`/signs/${encodeURIComponent(signName)}`, true)
      .then(Sign.fromDto)
  }
}

export default SignRepository
