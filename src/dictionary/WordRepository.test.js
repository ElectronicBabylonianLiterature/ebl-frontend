import { factory } from 'factory-girl'
import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'
import Auth from 'auth/Auth'
import WordRepository from './WordRepository'

let apiClient
let wordRepository
let promise
let word

beforeEach(async () => {
  apiClient = new ApiClient(new Auth())
  wordRepository = new WordRepository(apiClient)
  word = await factory.build('word')
})

describe('find', () => {
  beforeEach(async () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(word))
    promise = wordRepository.find(word._id)
  })

  it('Queries the word', () => {
    expect(apiClient.fetchJson).toBeCalledWith(`/words/${encodeURIComponent(word._id)}`, true)
  })

  it('Resolves to word', async () => {
    await expect(promise).resolves.toEqual(word)
  })
})

describe('search', () => {
  const query = 'the king'

  beforeEach(async () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve([word]))
    promise = wordRepository.search(query)
  })

  it('Queries words', () => {
    expect(apiClient.fetchJson).toBeCalledWith(`/words?query=${encodeURIComponent(query)}`, true)
  })

  it('Resolves to words', async () => {
    await expect(promise).resolves.toEqual([word])
  })
})

describe('update', () => {
  const result = 'ok'

  beforeEach(async () => {
    jest.spyOn(apiClient, 'postJson').mockReturnValueOnce(Promise.resolve(result))
    promise = wordRepository.update(word)
  })

  it('Posts the fragment', () => {
    expect(apiClient.postJson).toBeCalledWith(`/words/${encodeURIComponent(word._id)}`, word)
  })

  it('Resolves', async () => {
    await expect(promise).resolves.toBeDefined()
  })
})
