// @flow
import Promise from 'bluebird'
import cancellableFetch from './cancellableFetch'

export default function checkUrl(url: string): Promise<boolean> {
  return cancellableFetch(url, {
    method: 'HEAD',
    redirect: 'follow'
  }).then(response => response.ok)
}
