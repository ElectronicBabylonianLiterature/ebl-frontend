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
  private attachSignToToken(token: AnnotationToken): Promise<AnnotationToken> {
    if (
      [
        AnnotationTokenType.HasSign,
        AnnotationTokenType.CompoundGrapheme,
        AnnotationTokenType.Number,
      ].includes(token.type)
    ) {
      return this.search({
        value: token.name,
        ...(token.subIndex && { subIndex: token.subIndex }),
      }).then((results) => {
        const isValidResult = results.length > 0
        if (
          [
            AnnotationTokenType.Number,
            AnnotationTokenType.CompoundGrapheme,
          ].includes(token.type) ||
          isValidResult
        ) {
          return isValidResult
            ? token.attachSign(results[0])
            : Promise.resolve(token)
        } else {
          throw Error(
            `Reading '${token.name}' with subIndex '${token.subIndex}' has no corresponding Sign.`
          )
        }
      })
    }
    return Promise.resolve(token)
  }

  associateSigns(
    tokens: ReadonlyArray<ReadonlyArray<AnnotationToken>>
  ): Promise<ReadonlyArray<ReadonlyArray<AnnotationToken>>> {
    const tokensWithSigns = tokens.map((tokensRow) =>
      tokensRow.map((token) => this.attachSignToToken(token))
    )
    return Promise.all(tokensWithSigns.map((token) => Promise.all(token)))
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
