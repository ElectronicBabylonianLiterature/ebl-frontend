import ApiClient from 'http/ApiClient'
import SignRepository from 'signs/infrastructure/SignRepository'
import { AnnotationToken } from 'fragmentarium/domain/annotation-token'
import { AnnotationTokenType } from 'fragmentarium/domain/annotation'
import { MesopotamianDate } from 'chronology/domain/Date'

jest.mock('http/ApiClient')

const apiClient = new (ApiClient as jest.Mock<jest.Mocked<ApiClient>>)()
const signsRepository = new SignRepository(apiClient)
const abortSignal = new AbortController().signal
const dateDto = {
  year: { value: '1' },
  month: { value: '1' },
  day: { value: '1' },
  isSeleucidEra: true,
}

beforeEach(() => {
  jest.clearAllMocks()
})

it('keeps a number token without a matching sign unchanged', async () => {
  const numberToken = new AnnotationToken(
    '1',
    AnnotationTokenType.Number,
    '1',
    [0],
    true,
    null,
    '1',
    1,
  )
  apiClient.fetchJson.mockResolvedValueOnce([])

  await expect(
    signsRepository.associateSigns([[numberToken]]),
  ).resolves.toStrictEqual([[numberToken]])
})

it('turns a dated cropped annotation into a MesopotamianDate', async () => {
  apiClient.fetchJson.mockResolvedValueOnce([
    { fragmentNumber: 'K.1', image: 'image', script: 'NA', date: dateDto },
  ])

  const [annotation] = await signsRepository.getCentroidImages('BAR')

  expect(annotation.date).toEqual(MesopotamianDate.fromJson(dateDto))
})

it('passes the abort signal when finding signs by order', async () => {
  apiClient.fetchJson.mockResolvedValueOnce([[]])

  await signsRepository.findSignsByOrder(
    'BAR',
    'neoBabylonianOnset',
    abortSignal,
  )

  expect(apiClient.fetchJson).toHaveBeenCalledWith(
    '/signs/BAR/neoBabylonianOnset',
    false,
    abortSignal,
  )
})
