import { factory } from 'factory-girl'
import Promise from 'bluebird'
import ApiClient from 'http/ApiClient'
import Auth from 'auth0/Auth'
import FragmentRepository from './FragmentRepository'

let apiClient
let fragmentRepository
let promise
let fragment

beforeEach(async () => {
  apiClient = new ApiClient(new Auth())
  fragmentRepository = new FragmentRepository(apiClient)
  fragment = await factory.build('fragment')
})

describe('statistics', () => {
  let statistics

  beforeEach(async () => {
    statistics = await factory.build('statistics')
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(statistics))
    promise = fragmentRepository.statistics()
  })

  it('Queries the statistics', () => {
    expect(apiClient.fetchJson).toBeCalledWith('/statistics', false)
  })

  it('Resolves to statistics', async () => {
    await expect(promise).resolves.toEqual(statistics)
  })
})

describe('find', () => {
  beforeEach(async () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve(fragment))
    promise = fragmentRepository.find(fragment._id)
  })

  it('Queries the fragment', () => {
    expect(apiClient.fetchJson).toBeCalledWith(`/fragments/${encodeURIComponent(fragment._id)}`, true)
  })

  it('Resolves to fragment', async () => {
    await expect(promise).resolves.toEqual(fragment)
  })
})

describe('searchNumber', () => {
  beforeEach(async () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve([fragment]))
    promise = fragmentRepository.searchNumber(fragment.cdliNumber)
  })

  it('Queries fragments', () => {
    expect(apiClient.fetchJson).toBeCalledWith(`/fragments?number=${encodeURIComponent(fragment.cdliNumber)}`, true)
  })

  it('Resolves to fragments', async () => {
    await expect(promise).resolves.toEqual([fragment])
  })
})

describe('searchTransliteration', () => {
  const query = 'kur\nkur'

  beforeEach(async () => {
    jest.spyOn(apiClient, 'fetchJson').mockReturnValueOnce(Promise.resolve([fragment]))
    promise = fragmentRepository.searchTransliteration(query)
  })

  it('Queries fragments', () => {
    expect(apiClient.fetchJson).toBeCalledWith(`/fragments?transliteration=${encodeURIComponent(query)}`, true)
  })

  it('Resolves to fragments', async () => {
    await expect(promise).resolves.toEqual([fragment])
  })
})

describe('updateTransliteration', () => {
  const number = 'K.1'
  const transliteration = 'transliteration'
  const notes = 'notes'
  const result = 'ok'

  beforeEach(async () => {
    jest.spyOn(apiClient, 'postJson').mockReturnValueOnce(Promise.resolve(result))
    promise = fragmentRepository.updateTransliteration(number, transliteration, notes)
  })

  it('Posts the fragment', () => {
    expect(apiClient.postJson).toBeCalledWith(`/fragments/${encodeURIComponent(number)}`, {
      transliteration,
      notes
    })
  })

  it('Resolves', async () => {
    await expect(promise).resolves.toBeDefined()
  })
})
