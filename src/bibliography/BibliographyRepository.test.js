
import Promise from 'bluebird'
import { testDelegation } from 'testHelpers'
import BibliographyRepository from './BibliographyRepository'
import BibliographyEntry from './bibliographyEntry'

const apiClient = {
  fetchJson: jest.fn(),
  postJson: jest.fn()
}
const wordRepository = new BibliographyRepository(apiClient)
const author = 'Bor Ger'
const year = '1998'
const title = 'The Qualifications'
const id = 'RN 2020'
const resultStub = {
  id: id
}
const entry = new BibliographyEntry(resultStub)

const testData = [
  ['find', [id], apiClient.fetchJson, entry, [`/bibliography/${encodeURIComponent(id)}`, true], Promise.resolve(resultStub)],
  ['search', [author, year, title], apiClient.fetchJson, [entry], [`/bibliography?author=${encodeURIComponent(author)}&title=${encodeURIComponent(title)}&year=${encodeURIComponent(year)}`, true], Promise.resolve([resultStub])],
  ['update', [entry], apiClient.postJson, entry, [`/bibliography/${encodeURIComponent(id)}`, resultStub], Promise.resolve(resultStub)]
]

testDelegation(wordRepository, testData)
