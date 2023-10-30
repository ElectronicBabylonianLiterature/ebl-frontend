import { testDelegation, TestData } from 'test-support/utils'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import AfoRegisterRepository from 'afo-register/infrastructure/AfoRegisterRepository'
import { stringify } from 'query-string'

jest.mock('afo-register/infrastructure/AfoRegisterRepository', () => {
  return function () {
    return {
      search: jest.fn(),
    }
  }
})

const resultStub = {
  afoNumber: 'AfO 1',
  page: '2',
  text: 'some text',
  textNumber: '5',
}
const afoRegisterRepository = new (AfoRegisterRepository as jest.Mock)()
const afoRegisterService = new AfoRegisterService(afoRegisterRepository)

const testData: TestData<AfoRegisterService>[] = [
  new TestData(
    'search',
    [
      stringify({
        afoNumber: 'AfO 1',
        page: '2',
      }),
    ],
    afoRegisterRepository.search,
    [resultStub]
  ),
  new TestData(
    'search',
    [
      stringify({
        text: 'some text',
        textNumber: '5',
      }),
    ],
    afoRegisterRepository.search,
    [resultStub]
  ),
]
describe('afoRegisterService', () =>
  testDelegation(afoRegisterService, testData))
