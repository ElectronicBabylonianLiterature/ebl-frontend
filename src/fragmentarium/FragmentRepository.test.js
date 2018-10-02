import Promise from 'bluebird'
import { testDelegation } from 'testHelpers'
import FragmentRepository from './FragmentRepository'

const apiClient = {
  fetchJson: jest.fn(),
  postJson: jest.fn()
}
const fragmentRepository = new FragmentRepository(apiClient)

const fragmentId = 'K+1234'
const transliterationQuery = 'kur\nkur'
const transliteration = 'transliteration'
const notes = 'notes'
const resultStub = {}

const testData = [
  ['statistics', [], apiClient.fetchJson, resultStub, ['/statistics', false], Promise.resolve(resultStub)],
  ['find', [fragmentId], apiClient.fetchJson, resultStub, [`/fragments/${encodeURIComponent(fragmentId)}`, true], Promise.resolve(resultStub)],
  ['random', [], apiClient.fetchJson, [resultStub], ['/fragments?random=true', true], Promise.resolve([resultStub])],
  ['interesting', [], apiClient.fetchJson, [resultStub], ['/fragments?interesting=true', true], Promise.resolve([resultStub])],
  ['searchNumber', [fragmentId], apiClient.fetchJson, resultStub, [`/fragments?number=${encodeURIComponent(fragmentId)}`, true], Promise.resolve(resultStub)],
  ['searchTransliteration', [transliterationQuery], apiClient.fetchJson, [resultStub], [`/fragments?transliteration=${encodeURIComponent(transliterationQuery)}`, true], Promise.resolve([resultStub])],
  ['updateTransliteration', [fragmentId, transliteration, notes], apiClient.postJson, resultStub, [`/fragments/${encodeURIComponent(fragmentId)}`, {
    transliteration,
    notes
  }], Promise.resolve(resultStub)]
]

testDelegation(fragmentRepository, testData)
