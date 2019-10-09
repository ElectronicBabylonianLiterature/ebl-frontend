// @flow
/* global AbortController */
import Promise from 'bluebird'

export default function cancellableFetch(
  url: string,
  options: { [string]: any } = {}
): Promise<Response> {
  return new Promise((resolve, reject, onCancel) => {
    const abortController = new AbortController()
    fetch(url, {
      ...options,
      signal: abortController.signal
    })
      .then(resolve)
      .catch(reject)
    onCancel(() => abortController.abort())
  })
}
