import {
  apiClient,
  fragmentId,
  fragmentInfoDto,
  fragmentRepository,
  lineToVecRankingDto,
  resultStub,
} from 'fragmentarium/infrastructure/fragmentRepository.testSupport'

type AbortableRead = {
  readonly name: string
  readonly call: (signal: AbortSignal) => Promise<unknown>
  readonly expectedPath: string
  readonly response: unknown
}

const fragmentInfosResponse = [fragmentInfoDto]

const abortableReads: readonly AbortableRead[] = [
  {
    name: 'statistics',
    call: (signal) => fragmentRepository.statistics(signal),
    expectedPath: '/statistics',
    response: resultStub,
  },
  {
    name: 'lineToVecRanking',
    call: (signal) => fragmentRepository.lineToVecRanking(fragmentId, signal),
    expectedPath: `/fragments/${encodeURIComponent(fragmentId)}/match`,
    response: lineToVecRankingDto,
  },
  {
    name: 'fragmentPager',
    call: (signal) => fragmentRepository.fragmentPager(fragmentId, signal),
    expectedPath: `/fragments/${encodeURIComponent(fragmentId)}/pager`,
    response: resultStub,
  },
  {
    name: 'findInCorpus',
    call: (signal) => fragmentRepository.findInCorpus(fragmentId, signal),
    expectedPath: `/fragments/${encodeURIComponent(fragmentId)}/corpus`,
    response: resultStub,
  },
  {
    name: 'random',
    call: (signal) => fragmentRepository.random(signal),
    expectedPath: '/fragments?random=true',
    response: fragmentInfosResponse,
  },
  {
    name: 'interesting',
    call: (signal) => fragmentRepository.interesting(signal),
    expectedPath: '/fragments?interesting=true',
    response: fragmentInfosResponse,
  },
  {
    name: 'fetchNeedsRevision',
    call: (signal) => fragmentRepository.fetchNeedsRevision(signal),
    expectedPath: '/fragments?needsRevision=true',
    response: fragmentInfosResponse,
  },
]

beforeEach(() => {
  jest.clearAllMocks()
})

describe.each(abortableReads)(
  '$name forwards the abort signal',
  ({ call, expectedPath, response }: AbortableRead) => {
    it('passes the caller signal to the API client', async () => {
      const controller = new AbortController()
      apiClient.fetchJson.mockReturnValueOnce(Promise.resolve(response))

      await call(controller.signal)

      expect(apiClient.fetchJson).toHaveBeenCalledWith(
        expectedPath,
        false,
        controller.signal,
      )
    })
  },
)
