import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import ApiClient from 'http/ApiClient'
import SignRepository from 'signs/infrastructure/SignRepository'
import Sign from 'signs/domain/Sign'
import { stringify } from 'query-string'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import { signFactory } from 'test-support/sign-fixtures'
import { AnnotationTokenType } from 'fragmentarium/domain/annotation'

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
  fossey: [],
  mesZl: '',
  LaBaSi: '',
  unicode: [],
})
const getImagesResult = {
  fragmentNumber: 'K.6400',
  image: 'test-image',
  label: 'test-label',
  script: 'script-label',
}

const testData: TestData<SignRepository>[] = [
  new TestData(
    'find',
    [signName],
    apiClient.fetchJson,
    resultStub,
    [`/signs/${encodeURIComponent(signName)}`, false],
    Promise.resolve(resultStub),
  ),
  new TestData(
    'search',
    [query],
    apiClient.fetchJson,
    [resultStub],
    [`/signs?${stringify(query)}`, false],
    Promise.resolve([resultStub]),
  ),
  new TestData(
    'getImages',
    [signName],
    apiClient.fetchJson,
    [getImagesResult],
    [`/signs/${encodeURIComponent(signName)}/images`, false],
    Promise.resolve([getImagesResult]),
  ),
  new TestData(
    'listAllSigns',
    [],
    apiClient.fetchJson,
    [],
    ['/signs/all', false],
    Promise.resolve([]),
  ),
]
describe('test word repository', () => {
  testDelegation(signsRepository, testData)
})
describe('associate signs', () => {
  const tokens = [
    [
      new AnnotationToken(
        'kur1',
        AnnotationTokenType.HasSign,
        'kur1',
        [0],
        true,
        null,
        'kur1',
        1,
      ),
      new AnnotationToken(
        'kur2',
        AnnotationTokenType.HasSign,
        'kur2',
        [0],
        true,
        null,
        'kur2',
        1,
      ),
      new AnnotationToken(
        'single ruling',
        AnnotationTokenType.RulingDollarLine,
        'single ruling',
        [0],
        true,
        null,
        'kur2',
        1,
      ),
    ],
  ]
  it('succesfull', async () => {
    const sign1 = signFactory.build({ name: 'BAR' })
    jest
      .spyOn(signsRepository, 'search')
      .mockImplementationOnce(() =>
        Promise.resolve([sign1, signFactory.build()]),
      )
      .mockImplementationOnce(() => Promise.resolve([sign1]))
    await expect(signsRepository.associateSigns(tokens)).resolves.toStrictEqual(
      [
        [
          new AnnotationToken(
            'kur1',
            AnnotationTokenType.HasSign,
            'kur1',
            [0],
            true,
            sign1,
            'kur1',
            1,
          ),
          new AnnotationToken(
            'kur2',
            AnnotationTokenType.HasSign,
            'kur2',
            [0],
            true,
            sign1,
            'kur2',
            1,
          ),
          new AnnotationToken(
            'single ruling',
            AnnotationTokenType.RulingDollarLine,
            'single ruling',
            [0],
            true,
            null,
            'kur2',
            1,
          ),
        ],
      ],
    )
  })
  it('associate signs throws error', async () => {
    jest
      .spyOn(signsRepository, 'search')
      .mockImplementation(() => Promise.resolve([]))
    try {
      await signsRepository.associateSigns(tokens)
    } catch (e) {
      expect(e).toEqual(
        new Error(
          "Reading 'kur1' with subIndex '1' has no corresponding Sign.",
        ),
      )
    }
  })
})
