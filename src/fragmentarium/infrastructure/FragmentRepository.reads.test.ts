import { testDelegation, TestData } from 'test-support/utils'
import FragmentRepository from 'fragmentarium/infrastructure/FragmentRepository'
import { fragment, fragmentDto } from 'test-support/test-fragment'
import { annotations, annotationsDto } from 'test-support/test-annotation'
import { stringify } from 'querystring'
import {
  createFragmentRepositoryTestContext,
  fragmentId,
  folio,
  fragmentInfo,
  fragmentInfoDto,
  lineToVecRanking,
  lineToVecRankingDto,
  resultStub,
  word,
} from 'fragmentarium/infrastructure/FragmentRepository.testSupport'

const { apiClient, fragmentRepository } = createFragmentRepositoryTestContext()

const testData: TestData<FragmentRepository>[] = [
  new TestData(
    'statistics',
    [],
    apiClient.fetchJson,
    resultStub,
    ['/statistics', false, undefined],
    Promise.resolve(resultStub),
  ),
  new TestData(
    'lineToVecRanking',
    [fragmentId],
    apiClient.fetchJson,
    lineToVecRanking,
    [`/fragments/${encodeURIComponent(fragmentId)}/match`, false, undefined],
    Promise.resolve(lineToVecRankingDto),
  ),
  new TestData(
    'find',
    [fragmentId],
    apiClient.fetchJson,
    fragment,
    [`/fragments/${encodeURIComponent(fragmentId)}`, false],
    Promise.resolve(fragmentDto),
  ),
  new TestData(
    'find',
    [fragmentId, [0]],
    apiClient.fetchJson,
    fragment,
    [
      `/fragments/${encodeURIComponent(fragmentId)}?${stringify({
        lines: [0],
      })}`,
      false,
    ],
    Promise.resolve(fragmentDto),
  ),
  new TestData(
    'find',
    [fragmentId, null],
    apiClient.fetchJson,
    fragment,
    [`/fragments/${encodeURIComponent(fragmentId)}`, false],
    Promise.resolve(fragmentDto),
  ),
  new TestData(
    'random',
    [],
    apiClient.fetchJson,
    [fragmentInfo],
    ['/fragments?random=true', false, undefined],
    Promise.resolve([fragmentInfoDto]),
  ),
  new TestData(
    'interesting',
    [],
    apiClient.fetchJson,
    [fragmentInfo],
    ['/fragments?interesting=true', false, undefined],
    Promise.resolve([fragmentInfoDto]),
  ),
  new TestData(
    'fetchNeedsRevision',
    [],
    apiClient.fetchJson,
    [fragmentInfo],
    ['/fragments?needsRevision=true', false, undefined],
    Promise.resolve([fragmentInfoDto]),
  ),
  new TestData(
    'folioPager',
    [folio, fragmentId],
    apiClient.fetchJson,
    resultStub,
    [
      `/fragments/${encodeURIComponent(fragmentId)}/pager/${encodeURIComponent(
        folio.name,
      )}/${encodeURIComponent(folio.number)}`,
      false,
      undefined,
    ],
    Promise.resolve(resultStub),
  ),
  new TestData(
    'fragmentPager',
    [fragmentId],
    apiClient.fetchJson,
    resultStub,
    [`/fragments/${encodeURIComponent(fragmentId)}/pager`, false, undefined],
    Promise.resolve(resultStub),
  ),
  new TestData(
    'findLemmas',
    [word, true],
    apiClient.fetchJson,
    resultStub,
    [`/lemmas?word=${encodeURIComponent(word)}&isNormalized=true`, false],
    Promise.resolve(resultStub),
  ),
  new TestData(
    'findAnnotations',
    [fragmentId, true],
    apiClient.fetchJson,
    annotations,
    [
      `/fragments/${encodeURIComponent(
        fragmentId,
      )}/annotations?generateAnnotations=true`,
      false,
      undefined,
    ],
    Promise.resolve({ annotations: annotationsDto }),
  ),
  new TestData(
    'findAnnotations',
    [fragmentId],
    apiClient.fetchJson,
    annotations,
    [
      `/fragments/${encodeURIComponent(
        fragmentId,
      )}/annotations?generateAnnotations=false`,
      false,
      undefined,
    ],
    Promise.resolve({ annotations: annotationsDto }),
  ),
  new TestData(
    'listAllFragments',
    [],
    apiClient.fetchJson,
    [],
    ['/fragments/all', false],
    Promise.resolve([]),
  ),
]

describe('FragmentRepository reads', () =>
  testDelegation(fragmentRepository, testData))
