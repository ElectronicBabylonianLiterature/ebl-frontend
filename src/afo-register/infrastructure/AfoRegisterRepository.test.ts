import { testDelegation, TestData } from 'test-support/utils'
import AfoRegisterRepository from 'afo-register/infrastructure/AfoRegisterRepository'
import AfoRegisterRecord, {
  AfoRegisterRecordSuggestion,
} from 'afo-register/domain/Record'
import { stringify } from 'query-string'
import ApiClient from 'http/ApiClient'
import Bluebird from 'bluebird'

jest.mock('http/ApiClient')
const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()

const afoRegisterRepository = new AfoRegisterRepository(apiClient)

const resultStub = {
  afoNumber: 'AfO 1',
  page: '2',
  text: 'some text',
  textNumber: '5',
  discussedBy: '',
  discussedByNotes: '',
  linesDiscussed: '',
}

const query = { afoNumber: resultStub.afoNumber, page: resultStub.page }
const entry = new AfoRegisterRecord(resultStub)
const suggestionEntry = new AfoRegisterRecordSuggestion({
  text: 'some text',
  textNumbers: undefined,
})

const testData: TestData<AfoRegisterRepository>[] = [
  new TestData(
    'search',
    [
      stringify({
        afoNumber: 'AfO 1',
        page: '2',
      }),
    ],
    apiClient.fetchJson,
    [entry],
    [`/afo-register?${stringify(query)}`, false],
    Promise.resolve([resultStub])
  ),
  new TestData(
    'searchTextsAndNumbers',
    [['text1', 'number1']],
    apiClient.postJson,
    [entry],
    ['/afo-register/texts-numbers', ['text1', 'number1'], false],
    Promise.resolve([resultStub])
  ),
  new TestData(
    'searchSuggestions',
    ['suggestion query'],
    apiClient.fetchJson,
    [suggestionEntry],
    ['/afo-register/suggestions?text_query=suggestion query', false],
    Promise.resolve([resultStub])
  ),
]
describe('afoRegisterService', () =>
  testDelegation(afoRegisterRepository, testData))

describe('AfoRegisterRepository - search', () => {
  it('should handle search without fragmentService', async () => {
    apiClient.fetchJson.mockReturnValue(Bluebird.resolve([entry]))
    const response = await afoRegisterRepository.search(stringify(query))
    expect(response).toEqual([entry])
    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      `/afo-register?${stringify(query)}`,
      false
    )
  })

  it('should handle different query strings', async () => {
    const query2 = { afoNumber: 'AfO 2', page: '3' }
    const entry2 = new AfoRegisterRecord({
      text: 'Some text',
      textNumber: '22',
      afoNumber: 'AfO 2',
      page: '3',
    })
    apiClient.fetchJson.mockResolvedValueOnce([resultStub, entry2])
    const response = await afoRegisterRepository.search(stringify(query2))
    expect(response).toEqual([entry, entry2])
  })

  it('should handle empty response', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([])
    const response = await afoRegisterRepository.search(stringify(query))
    expect(response).toEqual([])
  })

  it('should handle API errors', async () => {
    apiClient.fetchJson.mockRejectedValueOnce(new Error('API Error'))
    await expect(
      afoRegisterRepository.search(stringify(query))
    ).rejects.toThrow('API Error')
  })
})

describe('AfoRegisterRepository - searchTextsAndNumbers', () => {
  it('should handle various text and number combinations', async () => {
    const query2 = ['text2', 'number2']
    const entry2 = new AfoRegisterRecord({
      ...resultStub,
      text: 'text2',
      textNumber: 'number2',
    })
    apiClient.postJson.mockResolvedValueOnce([resultStub, entry2])
    const response = await afoRegisterRepository.searchTextsAndNumbers(query2)
    expect(response).toEqual([entry, entry2])
  })

  it('should handle empty response', async () => {
    apiClient.postJson.mockResolvedValueOnce([])
    const response = await afoRegisterRepository.searchTextsAndNumbers([
      'text1',
      'number1',
    ])
    expect(response).toEqual([])
  })

  it('should handle API errors', async () => {
    apiClient.postJson.mockRejectedValueOnce(new Error('API Error'))
    await expect(
      afoRegisterRepository.searchTextsAndNumbers(['text1', 'number1'])
    ).rejects.toThrow('API Error')
  })
})

describe('AfoRegisterRepository - searchSuggestions', () => {
  it('should handle different query strings', async () => {
    const query2 = 'different suggestion query'
    const suggestionEntry2 = new AfoRegisterRecordSuggestion({
      ...resultStub,
      text: 'different text',
    })
    apiClient.fetchJson.mockResolvedValueOnce([resultStub, suggestionEntry2])
    const response = await afoRegisterRepository.searchSuggestions(query2)
    expect(response).toEqual([suggestionEntry, suggestionEntry2])
  })

  it('should handle empty response', async () => {
    apiClient.fetchJson.mockResolvedValueOnce([])
    const response = await afoRegisterRepository.searchSuggestions(
      'suggestion query'
    )
    expect(response).toEqual([])
  })

  it('should handle API errors', async () => {
    apiClient.fetchJson.mockRejectedValueOnce(new Error('API Error'))
    await expect(
      afoRegisterRepository.searchSuggestions('suggestion query')
    ).rejects.toThrow('API Error')
  })
})
