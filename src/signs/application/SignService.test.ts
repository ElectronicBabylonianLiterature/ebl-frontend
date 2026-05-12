import SignRepository from 'signs/infrastructure/SignRepository'
import SignService from 'signs/application/SignService'
import { TestData, testDelegation } from 'test-support/utils'

jest.mock('signs/infrastructure/SignRepository')

const resultStub = {}
const signRepository = new (SignRepository as jest.Mock<
  jest.Mocked<SignRepository>
>)()

const signService = new SignService(signRepository)

const testData: TestData<SignService>[] = [
  new TestData('find', ['signName'], signRepository.find, resultStub),
  new TestData(
    'search',
    [{ value: 'bar', subIndex: 1 }],
    signRepository.search,
    resultStub,
  ),
  new TestData(
    'getCentroidImages',
    ['signName'],
    signRepository.getCentroidImages,
    [resultStub],
  ),
  new TestData(
    'getClusterVariants',
    ['signName', 'cluster-id', 'NA'],
    signRepository.getClusterVariants,
    [resultStub],
  ),
  new TestData('listAllSigns', [], signRepository.listAllSigns, []),
  new TestData(
    'findSignsByOrder',
    ['signName', 'neoBabylonianOnset'],
    signRepository.findSignsByOrder,
    resultStub,
  ),
]

describe('test sign Service', () => {
  testDelegation(signService, testData)
})
