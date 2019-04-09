import Promise from 'bluebird'
import { List } from 'immutable'
import { testDelegation } from 'test-helpers/utils'
import Reference from 'bibliography/Reference'
import { Text, Chapter, Manuscript, periods, provenances, types } from './text'
import TextService from './TextService'

const apiClient = {
  fetchJson: jest.fn(),
  postJson: jest.fn()
}
const testService = new TextService(apiClient)

const textDto = {
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  numberOfVerses: 10,
  approximateVerses: true,
  chapters: [
    {
      classification: 'Ancient',
      stage: 'Old Babylonian',
      name: 'The Only Chapter',
      order: 1,
      manuscripts: [
        {
          uniqueId: 'abc-cde-123',
          siglum: 'UIII Nippur 1',
          museumNumber: 'BM.X',
          accession: 'X.1',
          period: 'Ur III',
          provenance: 'Nippur',
          type: 'School',
          references: [{
            id: 'RN1853',
            linesCited: [],
            notes: '',
            pages: '34-54',
            type: 'DISCUSSION',
            document: { id: 'RN1853' }
          }]
        }
      ]
    }
  ]
}

const textUpdateDto = {
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  numberOfVerses: 10,
  approximateVerses: true,
  chapters: [
    {
      classification: 'Ancient',
      stage: 'Old Babylonian',
      name: 'The Only Chapter',
      order: 1,
      manuscripts: [
        {
          uniqueId: 'abc-cde-123',
          siglum: 'UIII Nippur 1',
          museumNumber: 'BM.X',
          accession: 'X.1',
          period: 'Ur III',
          provenance: 'Nippur',
          type: 'School',
          references: [{
            id: 'RN1853',
            linesCited: [],
            notes: '',
            pages: '34-54',
            type: 'DISCUSSION'
          }]
        }
      ]
    }
  ]
}

const text = Text({
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  numberOfVerses: 10,
  approximateVerses: true,
  chapters: List.of(
    new Chapter({
      classification: 'Ancient',
      stage: 'Old Babylonian',
      name: 'The Only Chapter',
      order: 1,
      manuscripts: List.of(
        new Manuscript({
          uniqueId: 'abc-cde-123',
          siglum: 'UIII Nippur 1',
          museumNumber: 'BM.X',
          accession: 'X.1',
          period: periods.get('Ur III'),
          provenance: provenances.get('Nippur'),
          type: types.get('School'),
          references: List.of(new Reference(
            'DISCUSSION',
            '34-54',
            '',
            List(),
            { id: 'RN1853' }
          ))
        })
      )
    })
  )
})

const testData = [
  ['find', [text.category, text.index], apiClient.fetchJson, text, [`/texts/${encodeURIComponent(text.category)}/${encodeURIComponent(text.index)}`, true], Promise.resolve(textDto)],
  ['update', [text.category, text.index, text], apiClient.postJson, text, [`/texts/${encodeURIComponent(text.category)}/${encodeURIComponent(text.index)}`, textUpdateDto], Promise.resolve(textDto)]
]

testDelegation(testService, testData)
