import React from 'react'
import {fireEvent, renderIntoDocument, cleanup, wait} from 'react-testing-library'
import WordSearch from './WordSearch'

let onResponse

beforeEach(async () => {
  fetch.resetMocks()
  fetch.mockResponseOnce(JSON.stringify({ lemma: ['lemma'] }))
  onResponse = jest.fn()
  const {getByText, getByPlaceholderText} = renderIntoDocument(<WordSearch onResponse={onResponse} />)

  const lemma = getByPlaceholderText('lemma')
  lemma.value = 'lemma'
  fireEvent.change(lemma)

  const homonym = getByPlaceholderText('homonym')
  homonym.value = 'homonym'
  fireEvent.change(homonym)

  await wait()

  fireEvent.click(
    getByText((content, element) => element.tagName.toLowerCase() === 'button')
  )
})

afterEach(cleanup)

it('Calls onResponse with the response JSON', async () => {
  expect(await onResponse.mock.calls[0][0]).toEqual({ lemma: ['lemma'] })
})

it('Makes one request', async () => {
  expect(fetch).toBeCalled()
})

it('Queries the Dictionary API with fiven parameters', async () => {
  expect(fetch).toBeCalledWith('http://localhost:8000/words/lemma/homonym')
})
