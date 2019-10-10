/* global AbortController */
// @flow
import Promise from 'bluebird'

export default function cancellableFetch(
  url: sring,
  options: { [string]: any } = {}
): Promise<any> {
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
