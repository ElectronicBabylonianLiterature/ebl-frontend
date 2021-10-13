import ApiClient from 'http/ApiClient'
import Promise from 'bluebird'
import Sign, { SignQuery } from 'signs/domain/Sign'
import { stringify } from 'query-string'
import { AnnotationToken } from 'fragmentarium/ui/image-annotation/annotation-tool/annotation-token'

class SignRepository {
  private readonly apiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  associateSigns(
    tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
  ): Promise<ReadonlyArray<ReadonlyArray<AnnotationToken>>> {
    const tokensWithSigns = tokens.map((tokensRow) =>
      Promise.all(
        tokensRow.map((token) => {
          if (token.enabled) {
            return this.search({
              value: token.name,
              subIndex: token.subIndex ?? 1,
            }).then(
              (results) =>
                new AnnotationToken(
                  token.value,
                  token.path,
                  token.enabled,
                  results.length ? results[0] : null
                )
            )
          } else {
            return new AnnotationToken(token.value, token.path, token.enabled)
          }
        })
      )
    )
    return Promise.all(tokensWithSigns)
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
