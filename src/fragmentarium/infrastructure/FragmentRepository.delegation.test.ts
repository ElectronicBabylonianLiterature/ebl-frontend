import Promise from 'bluebird'
import { testDelegation, TestData } from 'test-support/utils'
import FragmentRepository from 'fragmentarium/infrastructure/FragmentRepository'
import { fragment, fragmentDto } from 'test-support/test-fragment'
import { colophonFactory } from 'test-support/colophon-fixtures'
import { stringify } from 'querystring'
import { textDto } from 'test-support/test-corpus-text'
import { chapterIdFactory } from 'test-support/chapter-fixtures'
import { manuscriptDtoFactory } from 'test-support/manuscript-fixtures'
import { wordDto } from 'test-support/test-word'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'

const apiClient = {
  fetchJson: jest.fn(),
  postJson: jest.fn(),
  fetchBlob: jest.fn(),
}
const fragmentRepository = new FragmentRepository(apiClient)

const fragmentId = 'K 23+1234'
const path = (...parts: string[]): string =>
  ['/fragments', encodeURIComponent(fragmentId), ...parts].join('/')

const colophon = colophonFactory.build()
const lemmaAnnotations = {}
const scopes = ['CAIC']
const colophonNames = ['Nabû-balāssu-iqbi']

const testData: TestData<FragmentRepository>[] = [
  new TestData(
    'fetchColophonNames',
    ['Nabû'],
    apiClient.fetchJson,
    colophonNames,
    [`/fragments/colophon-names?${stringify({ query: 'Nabû' })}`, false],
    Promise.resolve(colophonNames),
  ),
  new TestData(
    'updateScopes',
    [fragmentId, scopes],
    apiClient.postJson,
    fragment,
    // eslint-disable-next-line camelcase
    [path('scopes'), { authorized_scopes: scopes }],
    Promise.resolve(fragmentDto),
  ),
  new TestData(
    'updateLemmaAnnotation',
    [fragmentId, lemmaAnnotations],
    apiClient.postJson,
    fragment,
    [path('lemma-annotation'), lemmaAnnotations],
    Promise.resolve(fragmentDto),
  ),
  new TestData(
    'updateColophon',
    [fragmentId, colophon],
    apiClient.postJson,
    fragment,
    [path('colophon'), { colophon }],
    Promise.resolve(fragmentDto),
  ),
]

testDelegation(fragmentRepository, testData)

describe('findInCorpus', () => {
  const corpusPath = `${path()}/corpus`

  it('maps both attestation kinds from the response', async () => {
    apiClient.fetchJson.mockReturnValueOnce(
      Promise.resolve({
        manuscriptAttestations: [
          {
            text: textDto,
            chapterId: chapterIdFactory.build(),
            manuscript: manuscriptDtoFactory.build(),
            manuscriptSiglum: 'UrBM1',
          },
        ],
        uncertainFragmentAttestations: [
          { text: textDto, chapterId: chapterIdFactory.build() },
        ],
      }),
    )

    const result = await fragmentRepository.findInCorpus(fragmentId)

    expect(apiClient.fetchJson).toHaveBeenCalledWith(corpusPath, false)
    expect(result.manuscriptAttestations).toHaveLength(1)
    expect(result.manuscriptAttestations[0].manuscriptSiglum).toEqual('UrBM1')
    expect(result.uncertainFragmentAttestations).toHaveLength(1)
  })

  it('treats missing attestation lists as empty', async () => {
    apiClient.fetchJson.mockReturnValueOnce(Promise.resolve({}))

    const result = await fragmentRepository.findInCorpus(fragmentId)

    expect(result.manuscriptAttestations).toEqual([])
    expect(result.uncertainFragmentAttestations).toEqual([])
  })
})

describe('collectLemmaSuggestions', () => {
  it('turns each suggested word into a lemma option keyed by token', async () => {
    apiClient.fetchJson.mockReturnValueOnce(
      Promise.resolve({ 'Word-1': [wordDto] }),
    )

    const suggestions =
      await fragmentRepository.collectLemmaSuggestions(fragmentId)

    expect(apiClient.fetchJson).toHaveBeenCalledWith(
      `${path()}/collect-lemmas`,
      false,
    )
    expect([...suggestions.keys()]).toEqual(['Word-1'])
    const [option] = suggestions.get('Word-1') as LemmaOption[]
    expect(option.value).toEqual(wordDto._id)
    expect(option.isSuggestion).toBe(true)
  })
})
