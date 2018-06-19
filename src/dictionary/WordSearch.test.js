import React from 'react'
import {Simulate, render, wait} from 'react-testing-library'
import WordSearch from './WordSearch'
import HttpClient from '../http/HttpClient'
import Auth from '../auth0/Auth'

const result = [{
  lemma: ['lemma'],
  forms: [],
  homonym: 'I',
  amplifiedMeanings: {},
  derived: []
}]

let onResponse
let httpClient
let container

beforeEach(async () => {
  onResponse = jest.fn()

  httpClient = new HttpClient(new Auth())

  const element = render(<WordSearch onResponse={onResponse} httpClient={httpClient} />)
  container = element.container

  const lemma = element.getByPlaceholderText('lemma')
  lemma.value = 'lemma'
  Simulate.change(lemma)
})

it('Calls onResponse with the result on success', async () => {
  jest.spyOn(httpClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(result))
  await submit()

  expect(onResponse).toBeCalledWith(result)
})

it('Calls onResponse with the error on failure', async () => {
  const error = new Error('error')
  jest.spyOn(httpClient, 'fetchJson').mockReturnValueOnce(Promise.reject(error))
  await submit()

  expect(onResponse).toBeCalledWith(null, error)
})

it('Queries the Dictionary API with given parameters', async () => {
  jest.spyOn(httpClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(result))
  await submit()

  const expectedUrl = 'http://localhost:8000/words/search/lemma'
  expect(httpClient.fetchJson).toBeCalledWith(expectedUrl)
})

async function submit () {
  Simulate.submit(container.querySelector('form'))
  await wait()
}
