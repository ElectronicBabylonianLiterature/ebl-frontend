export type JsonApiClient = {
  fetchJson: <T = unknown>(
    url: string,
    authorize: boolean,
    signal?: AbortSignal,
  ) => Promise<T>
  fetchBlob: (
    url: string,
    authorize: boolean,
    signal?: AbortSignal,
  ) => Promise<Blob>
  postJson: <T = unknown>(
    url: string,
    body: Record<string, unknown>,
    authorize?: boolean,
  ) => Promise<T>
}
