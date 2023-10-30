import AfoRegisterRecord from 'afo-register/domain/Record'
import ApiClient from 'http/ApiClient'
import AfoRegisterRepository from './AfoRegisterRepository'
import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'

jest.mock('afo-register/domain/Record')
jest.mock('http/ApiClient')

const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()

const afoRegisterRepository = new AfoRegisterRepository(apiClient)
const query = '{"afoNumber": "AfO 12", "page": "321"}'
const resultStub = {
  afoNumber: 'AfO 12',
  page: '321',
  text: 'text',
  textNumber: 'text number',
} as AfoRegisterRecord
const entry = new AfoRegisterRecord(resultStub)

const testData: TestData<AfoRegisterRepository>[] = [
  new TestData(
    'search',
    [query],
    apiClient.fetchJson,
    [entry],
    [`/afo-register?${encodeURIComponent(query)}`, false],
    Promise.resolve([entry])
  ),
]

describe('AfoRegisterRepository', () =>
  testDelegation(afoRegisterRepository, testData))
