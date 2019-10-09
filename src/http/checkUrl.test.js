// @flow
jest.mock('./cancellableFetch')

import Promise from 'bluebird'
import cancellableFetch from './cancellableFetch'
import checkUrl from './checkUrl'

const url = 'http://example.com'

test('Resolves on ok response', async () => {
  cancellableFetch.mockReturnValueOnce(
    Promise.resolve(new Response(null, { status: 200 }))
  )
  expect(checkUrl(url)).resolves.toBe(true)
})

test('Resolves to false otherwise', async () => {
  cancellableFetch.mockReturnValueOnce(
    Promise.resolve(new Response(null, { status: 404 }))
  )
  expect(checkUrl(url)).resolves.toBe(false)
})

test('Makes a HEAD request', async () => {
  cancellableFetch.mockReturnValueOnce(
    Promise.resolve(new Response(null, { status: 200 }))
  )
  await checkUrl(url)
  expect(cancellableFetch).toBeCalledWith(url, {
    method: 'HEAD',
    redirect: 'follow'
  })
})
