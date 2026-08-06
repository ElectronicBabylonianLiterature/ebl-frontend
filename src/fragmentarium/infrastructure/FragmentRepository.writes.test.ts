import { testDelegation, TestData } from 'test-support/utils'
import FragmentRepository, {
  createScript,
} from 'fragmentarium/infrastructure/FragmentRepository'
import { fragment, fragmentDto } from 'test-support/test-fragment'
import { annotations, annotationsDto } from 'test-support/test-annotation'
import { Genres } from 'fragmentarium/domain/Genres'
import {
  archaeology,
  createFragmentRepositoryTestContext,
  fragmentId,
  genres,
  introduction,
  lemmatization,
  mesopotamianDate,
  notes,
  references,
  script,
  transliteration,
} from 'fragmentarium/infrastructure/FragmentRepository.testSupport'

const { apiClient, fragmentRepository } = createFragmentRepositoryTestContext()

const editionUrl = `/fragments/${encodeURIComponent(fragmentId)}/edition`

const testData: TestData<FragmentRepository>[] = [
  new TestData(
    'updateEdition',
    [fragmentId, { transliteration }],
    apiClient.postJson,
    fragment,
    [editionUrl, { transliteration }],
    Promise.resolve(fragmentDto),
  ),
  new TestData(
    'updateEdition',
    [fragmentId, { notes }],
    apiClient.postJson,
    fragment,
    [editionUrl, { notes }],
    Promise.resolve(fragmentDto),
  ),
  new TestData(
    'updateEdition',
    [fragmentId, { introduction }],
    apiClient.postJson,
    fragment,
    [editionUrl, { introduction }],
    Promise.resolve(fragmentDto),
  ),
  new TestData(
    'updateEdition',
    [fragmentId, { introduction, notes, transliteration }],
    apiClient.postJson,
    fragment,
    [editionUrl, { introduction, notes, transliteration }],
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
  new TestData(
    'updateScript',
    [fragmentId, createScript(script)],
    apiClient.postJson,
    fragment,
    [`/fragments/${encodeURIComponent(fragmentId)}/script`, { script: script }],
    Promise.resolve(fragmentDto),
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
]

describe('FragmentRepository writes', () =>
  testDelegation(fragmentRepository, testData))
