import Promise from 'bluebird'
import { testDelegation } from 'testHelpers'
import FragmentRepository from './FragmentRepository'
import { factory } from 'factory-girl'
import createFolio from 'fragmentarium/createFolio'

const apiClient = {
  fetchJson: jest.fn(),
  postJson: jest.fn()
}
const fragmentRepository = new FragmentRepository(apiClient)

const fragmentId = 'K+1234'
const transliterationQuery = 'kur\nkur'
const transliteration = 'transliteration'
const lemmatization = [[{ value: 'kur', uniqueLemma: [] }]]
const notes = 'notes'
const resultStub = {}
const folio = createFolio('MJG', 'K1')

let fragmentDto
let fragment

beforeEach(async () => {
  fragmentDto = await factory.build('fragmentDto', { _id: fragmentId })
  fragment = {
    ...fragmentDto,
    folios: fragmentDto.folios.map(({ name, number }) => createFolio(name, number))
  }
})

const testData = [
  ['statistics', [], apiClient.fetchJson, resultStub, ['/statistics', false], Promise.resolve(resultStub)],
  ['find', [fragmentId], apiClient.fetchJson, fragment, [`/fragments/${encodeURIComponent(fragmentId)}`, true], Promise.resolve(fragmentDto)],
  ['random', [], apiClient.fetchJson, [fragment], ['/fragments?random=true', true], Promise.resolve([fragmentDto])],
  ['interesting', [], apiClient.fetchJson, [fragment], ['/fragments?interesting=true', true], Promise.resolve([fragmentDto])],
  ['searchNumber', [fragmentId], apiClient.fetchJson, fragment, [`/fragments?number=${encodeURIComponent(fragmentId)}`, true], Promise.resolve(fragmentDto)],
  ['searchTransliteration', [transliterationQuery], apiClient.fetchJson, [fragment], [`/fragments?transliteration=${encodeURIComponent(transliterationQuery)}`, true], Promise.resolve([fragmentDto])],
  ['updateTransliteration', [fragmentId, transliteration, notes], apiClient.postJson, resultStub, [`/fragments/${encodeURIComponent(fragmentId)}/transliteration`, {
    transliteration,
    notes
  }], Promise.resolve(resultStub)],
  ['updateLemmatization', [fragmentId, lemmatization], apiClient.postJson, resultStub, [`/fragments/${encodeURIComponent(fragmentId)}/lemmatization`, lemmatization], Promise.resolve(resultStub)],
  ['folioPager', [folio, fragmentId], apiClient.fetchJson, resultStub, [`/pager/folios/${encodeURIComponent(folio.name)}/${encodeURIComponent(folio.number)}/${encodeURIComponent(fragmentId)}`, true], Promise.resolve(resultStub)]
]

testDelegation(fragmentRepository, testData)
