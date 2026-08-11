import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import FragmentRepository, {
  createScript,
} from 'fragmentarium/infrastructure/FragmentRepository'
import { fragment, fragmentDto } from 'test-support/test-fragment'
import { annotations, annotationsDto } from 'test-support/test-annotation'
import { Genres } from 'fragmentarium/domain/Genres'
import {
  apiClient,
  archaeology,
  folio,
  fragmentId,
  fragmentRepository,
  genres,
  mesopotamianDate,
  resultStub,
  script,
  word,
} from 'fragmentarium/infrastructure/fragmentRepository.testSupport'

const testData: TestData<FragmentRepository>[] = [
  new TestData(
    'updateScript',
    [fragmentId, createScript(script)],
    apiClient.postJson,
    fragment,
    [`/fragments/${encodeURIComponent(fragmentId)}/script`, { script: script }],
    Promise.resolve(fragmentDto),
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
    ],
    Promise.resolve(resultStub),
  ),
  new TestData(
    'fragmentPager',
    [fragmentId],
    apiClient.fetchJson,
    resultStub,
    [`/fragments/${encodeURIComponent(fragmentId)}/pager`, false],
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
    ],
    Promise.resolve({ annotations: annotationsDto }),
  ),
  new TestData(
    'updateAnnotations',
    [fragmentId, annotations],
    apiClient.postJson,
    annotations,
    [
      `/fragments/${encodeURIComponent(fragmentId)}/annotations`,
      { fragmentNumber: fragmentId, annotations: annotationsDto },
    ],
    Promise.resolve(annotations),
  ),
  new TestData(
    'updateGenres',
    [fragmentId, new Genres(genres)],
    apiClient.postJson,
    fragment,
    [`/fragments/${encodeURIComponent(fragmentId)}/genres`, { genres }],
    Promise.resolve(fragmentDto),
  ),
  new TestData(
    'updateDate',
    [fragmentId, mesopotamianDate.toDto()],
    apiClient.postJson,
    fragment,
    [
      `/fragments/${encodeURIComponent(fragmentId)}/date`,
      { date: mesopotamianDate.toDto() },
    ],
    Promise.resolve(fragmentDto),
  ),
  new TestData(
    'updateDate',
    [fragmentId, undefined],
    apiClient.postJson,
    fragment,
    [`/fragments/${encodeURIComponent(fragmentId)}/date`, { date: undefined }],
    Promise.resolve(fragmentDto),
  ),
  new TestData(
    'updateDatesInText',
    [fragmentId, [mesopotamianDate.toDto()]],
    apiClient.postJson,
    fragment,
    [
      `/fragments/${encodeURIComponent(fragmentId)}/dates-in-text`,
      { datesInText: [mesopotamianDate.toDto()] },
    ],
    Promise.resolve(fragmentDto),
  ),
  new TestData(
    'updateArchaeology',
    [fragmentId, archaeology],
    apiClient.postJson,
    fragment,
    [
      `/fragments/${encodeURIComponent(fragmentId)}/archaeology`,
      { archaeology },
    ],
    Promise.resolve(fragmentDto),
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

describe('FragmentRepository updates', () =>
  testDelegation(fragmentRepository, testData))
