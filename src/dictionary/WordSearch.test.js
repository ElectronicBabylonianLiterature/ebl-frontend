import React from 'react'
import {Simulate, render} from 'react-testing-library'
import WordSearch from './WordSearch'

const word = {
  lemma: ['lemma'],
  forms: [],
  homonym: 'I',
  amplifiedMeanings: {},
  derived: []
}

let onResponse

beforeEach(async () => {
  fetch.resetMocks()
  fetch.mockResponseOnce(JSON.stringify(word))
  onResponse = jest.fn()

  const auth = {
    getAccessToken () {
      return 'accessToken'
    }
  }

  const {container, getByPlaceholderText} = render(<WordSearch onResponse={onResponse} auth={auth} />)

  const lemma = getByPlaceholderText('lemma')
  lemma.value = 'lemma'
  Simulate.change(lemma)

  const homonym = getByPlaceholderText('homonym')
  homonym.value = 'homonym'
  Simulate.change(homonym)

  Simulate.submit(container.querySelector('form'))
})

it('Calls onResponse with the response JSON', async () => {
  expect(await onResponse.mock.calls[0][0]).toEqual(word)
})

it('Makes one request', async () => {
  expect(fetch).toBeCalled()
})

it('Queries the Dictionary API with given parameters', async () => {
  const expectedHeaders = new Headers({'Authorization': `Bearer accessToken`})
  const expectedUrl = 'http://localhost:8000/words/lemma/homonym'
  expect(fetch).toBeCalledWith(expectedUrl, {headers: expectedHeaders})
})
