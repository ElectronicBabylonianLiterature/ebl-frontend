import { testDelegation, TestData } from 'test-support/utils'
import AfoRegisterRepository from 'afo-register/infrastructure/AfoRegisterRepository'
import AfoRegisterRecord, {
  AfoRegisterRecordSuggestion,
} from 'afo-register/domain/Record'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import { stringify } from 'query-string'

jest.mock('afo-register/infrastructure/AfoRegisterRepository')
const afoRegisterRepository = new (AfoRegisterRepository as jest.Mock)()

const afoRegisterService = new AfoRegisterService(afoRegisterRepository)

const resultStub = {
  afoNumber: 'AfO 1',
  page: '2',
  text: 'some text',
  textNumber: '5',
  discussedBy: '',
  discussedByNotes: '',
  linesDiscussed: '',
  fragmentNumbers: undefined,
}

const suggestionResultStub = {
  text: 'some text',
  textNumbers: undefined,
}

const query = { afoNumber: resultStub.afoNumber, page: resultStub.page }
const entry = new AfoRegisterRecord(resultStub)
const suggestionEntry = new AfoRegisterRecordSuggestion(suggestionResultStub)

const testData: TestData<AfoRegisterService>[] = [
  new TestData(
    'search',
    [stringify(query)],
    afoRegisterRepository.search,
    [entry],
    [stringify(query), undefined],
    Promise.resolve([entry])
  ),
  new TestData(
    'searchTextsAndNumbers',
    [['text1', 'number1']],
    afoRegisterRepository.searchTextsAndNumbers,
    [entry],
    [['text1', 'number1']],
    Promise.resolve([entry])
  ),
  new TestData(
    'searchSuggestions',
    ['suggestion query'],
    afoRegisterRepository.searchSuggestions,
    [suggestionEntry],
    ['suggestion query'],
    Promise.resolve([suggestionEntry])
  ),
]

describe('AfoRegisterService', () => {
  testDelegation(afoRegisterService, testData)
})
