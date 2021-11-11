import ApiClient from 'http/ApiClient'
import Promise from 'bluebird'
import Sign, { SignQuery } from 'signs/domain/Sign'
import { stringify } from 'query-string'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import { AnnotationTokenType } from 'fragmentarium/domain/annotation'

class SignRepository {
  private readonly apiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
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
    if (token.isSignPossiblyExisting()) {
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
