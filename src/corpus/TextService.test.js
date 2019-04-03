import Promise from 'bluebird'
import { List } from 'immutable'
import { testDelegation } from 'test-helpers/utils'
import { Text, Chapter, Manuscript, periods, provenances, types } from './text'
import TextService from './TextService'

const apiClient = {
  fetchJson: jest.fn()
}
const testService = new TextService(apiClient)

const textDto = {
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  chapters: [
    {
      classification: 'Ancient',
      stage: 'Old Babylonian',
      number: 1,
      manuscripts: [
        {
          uniqueId: 'abc-cde-123',
          siglum: 'UIII Nippur 1',
          museumNumber: 'BM.X',
          accession: 'X.1',
          period: 'Ur III',
          provenance: 'Nippur',
          type: 'School',
          bibliography: []
        }
      ]
    }
  ]
}

const text = Text({
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  chapters: List.of(
    new Chapter({
      classification: 'Ancient',
      stage: 'Old Babylonian',
      number: 1,
      manuscripts: List.of(
        new Manuscript({
          uniqueId: 'abc-cde-123',
          siglum: 'UIII Nippur 1',
          museumNumber: 'BM.X',
          accession: 'X.1',
          period: periods.get('Ur III'),
          provenance: provenances.get('Nippur'),
          type: types.get('School'),
          bibliography: new List()
        })
      )
    })
  )
})

const testData = [
  ['find', [text.category, text.index], apiClient.fetchJson, text, [`/texts/${encodeURIComponent(text.category)}.${encodeURIComponent(text.index)}`, true], Promise.resolve(textDto)]
]

testDelegation(testService, testData)
