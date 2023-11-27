import { testDelegation, TestData } from 'test-support/utils'
import AfoRegisterRepository from 'afo-register/infrastructure/AfoRegisterRepository'
import AfoRegisterRecord, {
  AfoRegisterRecordSuggestion,
} from 'afo-register/domain/Record'
import { stringify } from 'query-string'
import ApiClient from 'http/ApiClient'

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
