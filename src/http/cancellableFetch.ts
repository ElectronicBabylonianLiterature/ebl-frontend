import Promise from 'bluebird'

export default function cancellableFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  return new Promise((resolve, reject, onCancel) => {
    const abortController = new AbortController()
    fetch(url, {
      ...options,
      signal: abortController.signal,
    })
      .then(resolve)
      .catch(reject)
    onCancel && onCancel(() => abortController.abort())
  })
}
