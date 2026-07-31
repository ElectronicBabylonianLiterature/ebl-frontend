import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import FragmentRepository from 'fragmentarium/infrastructure/FragmentRepository'
import { fragment, fragmentDto } from 'test-support/test-fragment'
import { stringify } from 'querystring'
import {
  apiClient,
  fragmentId,
  fragmentInfo,
  fragmentInfoDto,
  fragmentRepository,
  introduction,
  lemmatization,
  lineToVecRanking,
  lineToVecRankingDto,
  notes,
  references,
  resultStub,
  transliteration,
} from 'fragmentarium/infrastructure/fragmentRepository.testSupport'

const testData: TestData<FragmentRepository>[] = [
  new TestData(
    'statistics',
    [],
    apiClient.fetchJson,
    resultStub,
    ['/statistics', false],
    Promise.resolve(resultStub),
  ),
  new TestData(
    'lineToVecRanking',
    [fragmentId],
    apiClient.fetchJson,
    lineToVecRanking,
    [`/fragments/${encodeURIComponent(fragmentId)}/match`, false],
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
    ['/fragments?random=true', false],
    Promise.resolve([fragmentInfoDto]),
  ),
  new TestData(
    'interesting',
    [],
    apiClient.fetchJson,
    [fragmentInfo],
    ['/fragments?interesting=true', false],
    Promise.resolve([fragmentInfoDto]),
  ),
  new TestData(
    'fetchNeedsRevision',
    [],
    apiClient.fetchJson,
    [fragmentInfo],
    ['/fragments?needsRevision=true', false],
    Promise.resolve([fragmentInfoDto]),
  ),
  new TestData(
    'updateEdition',
    [fragmentId, { transliteration }],
    apiClient.postJson,
    fragment,
    [
      `/fragments/${encodeURIComponent(fragmentId)}/edition`,
      {
        transliteration,
      },
    ],
    Promise.resolve(fragmentDto),
  ),
  new TestData(
    'updateEdition',
    [fragmentId, { notes }],
    apiClient.postJson,
    fragment,
    [
      `/fragments/${encodeURIComponent(fragmentId)}/edition`,
      {
        notes,
      },
    ],
    Promise.resolve(fragmentDto),
  ),
  new TestData(
    'updateEdition',
    [fragmentId, { introduction }],
    apiClient.postJson,
    fragment,
    [
      `/fragments/${encodeURIComponent(fragmentId)}/edition`,
      {
        introduction,
      },
    ],
    Promise.resolve(fragmentDto),
  ),
  new TestData(
    'updateEdition',
    [fragmentId, { introduction, notes, transliteration }],
    apiClient.postJson,
    fragment,
    [
      `/fragments/${encodeURIComponent(fragmentId)}/edition`,
      {
        introduction,
        notes,
        transliteration,
      },
    ],
    Promise.resolve(fragmentDto),
  ),
  new TestData(
    'updateLemmatization',
    [fragmentId, lemmatization],
    apiClient.postJson,
    fragment,
    [
      `/fragments/${encodeURIComponent(fragmentId)}/lemmatization`,
      { lemmatization: lemmatization },
    ],
    Promise.resolve(fragmentDto),
  ),
  new TestData(
    'updateReferences',
    [fragmentId, references],
    apiClient.postJson,
    fragment,
    [
      `/fragments/${encodeURIComponent(fragmentId)}/references`,
      { references: references },
    ],
    Promise.resolve(fragmentDto),
  ),
]

describe('FragmentRepository', () =>
  testDelegation(fragmentRepository, testData))
