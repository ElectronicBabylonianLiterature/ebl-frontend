import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import ApiClient from 'http/ApiClient'
import SignRepository from 'signs/infrastructure/SignRepository'
import Sign from 'signs/domain/Sign'
import { stringify } from 'query-string'
import {
  AnnotationToken,
  AnnotationToken_,
} from 'fragmentarium/ui/image-annotation/annotation-tool/annotation-token'
import { signFactory } from 'test-support/sign-fixtures'

jest.mock('http/ApiClient')

const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()
const signsRepository = new SignRepository(apiClient)
const signName = 'BAR'
const query = { value: 'bar', subIndex: 1 }

const resultStub = Sign.fromDto({
  name: '|E₂.BAR|',
  lists: [],
  values: [{ value: 'saŋŋa' }],
  logograms: [],
  mesZl: '',
  unicode: [],
})

const testData: TestData[] = [
  [
    'find',
    [signName],
    apiClient.fetchJson,
    resultStub,
    [`/signs/${encodeURIComponent(signName)}`, true],
    Promise.resolve(resultStub),
  ],
  [
    'search',
    [query],
    apiClient.fetchJson,
    [resultStub],
    [`/signs?${stringify(query)}`, true],
    Promise.resolve([resultStub]),
  ],
]
describe('test word repository', () => {
  testDelegation(signsRepository, testData)
})

it('test associate Signs', async () => {
  const sign1 = signFactory.build({ name: 'BAR' })
  jest
    .spyOn(signsRepository, 'search')
    .mockImplementationOnce(() => Promise.resolve([sign1]))
    .mockImplementationOnce(() => Promise.resolve([]))
  const tokens = [
    [
      new AnnotationToken_('kur1', [0], true, 'kur1', 1),
      new AnnotationToken_('kur2', [0], true, 'kur2', 1),
    ],
  ]

  await expect(signsRepository.associateSigns(tokens)).resolves.toStrictEqual([
    [
      new AnnotationToken('kur1', [0], true, sign1),
      new AnnotationToken('kur2', [0], true, null),
    ],
  ])
})
