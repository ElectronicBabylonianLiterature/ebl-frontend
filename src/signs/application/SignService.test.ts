import SignRepository from 'signs/infrastructure/SignRepository'
import SignService from 'signs/application/SignService'
import { TestData, testDelegation } from 'test-support/utils'

jest.mock('signs/infrastructure/SignRepository')
const resultStub = {}
const signRepository = new (SignRepository as jest.Mock<
  jest.Mocked<SignRepository>
>)()

const signService = new SignService(signRepository)

const testData: TestData[] = [
  ['find', ['signName'], signRepository.find, resultStub],
  [
    'search',
    [{ value: 'bar', subIndex: 1 }],
    signRepository.search,
    resultStub,
  ],
  ['getImages', ['signName'], signRepository.getImages, [resultStub]],
]
describe('test word Service', () => {
  testDelegation(signService, testData)
})
