import _ from 'lodash'
import ApiClient from 'http/ApiClient'
import { JsonApiClient } from 'http/JsonApiClient'

function isJsonBody(body: unknown): body is Record<string, unknown> {
  return _.isObject(body)
}

const unusedAuthentication = {
  getAccessToken: (): Promise<string> =>
    Promise.reject(new Error('JsonApiClientAdapter does not authenticate')),
  isAuthenticated: (): boolean => false,
}

export default class JsonApiClientAdapter extends ApiClient {
  private readonly json: JsonApiClient

  constructor(json: JsonApiClient) {
    super(unusedAuthentication, { captureException: _.noop })
    this.json = json
  }

  fetchJson<T = unknown>(
    path: string,
    authenticate: boolean,
    ...signal: [AbortSignal?]
  ): Promise<T> {
    return this.json.fetchJson<T>(path, authenticate, ...signal)
  }

  fetchBlob(
    path: string,
    authenticate: boolean,
    ...signal: [AbortSignal?]
  ): Promise<Blob> {
    return this.json.fetchBlob(path, authenticate, ...signal)
  }

  postJson<T = unknown>(
    path: string,
    body: unknown,
    ...authenticate: [boolean?]
  ): Promise<T> {
    return isJsonBody(body)
      ? this.json.postJson<T>(path, body, ...authenticate)
      : Promise.reject(new Error(`Unsupported postJson body for ${path}`))
  }

  putJson<T = unknown>(path: string): Promise<T> {
    return Promise.reject(new Error(`Unexpected putJson: ${path}`))
  }
}
