import Promise from 'bluebird'
import { testDelegation } from 'test-helpers/utils'
import TextService from './TextService'

const apiClient = {
  fetchJson: jest.fn()
}
const testService = new TextService(apiClient)

const text = {
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  chapters: [
    {
      classification: 'Ancient',
      period: 'NB',
      number: 1
    },
    {
      classification: 'Ancient',
      period: 'OB',
      number: 1
    }
  ]
}

const testData = [
  ['find', [text.category, text.index], apiClient.fetchJson, text, [`/texts/${encodeURIComponent(text.category)}.${encodeURIComponent(text.index)}`, true], Promise.resolve(text)]
]

testDelegation(testService, testData)
