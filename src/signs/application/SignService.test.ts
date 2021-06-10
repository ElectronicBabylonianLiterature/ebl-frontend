import SignsRepository from 'signs/infrastructure/SignsRepository'
import SignsService from 'signs/application/SignsService'
import { TestData, testDelegation } from 'test-support/utils'

jest.mock('signs/infrastructure/SignsRepository')
const resultStub = {}
const signsRepository = new (SignsRepository as jest.Mock<
  jest.Mocked<SignsRepository>
>)()

const signsService = new SignsService(signsRepository)

const testData: TestData[] = [
  ['find', ['signName'], signsRepository.find, resultStub],
  [
    'search',
    [{ value: 'bar', subIndex: 1 }],
    signsRepository.search,
    resultStub,
  ],
]
describe('test word Service', () => {
  testDelegation(signsService, testData)
})
