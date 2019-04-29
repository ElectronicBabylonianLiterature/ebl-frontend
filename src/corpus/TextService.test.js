import Promise from 'bluebird'
import { List } from 'immutable'
import { testDelegation } from 'test-helpers/utils'
import BibliographyEntry from 'bibliography/BibliographyEntry'
import Reference from 'bibliography/Reference'
import { createText, createChapter, createManuscript, createLine, createManuscriptLine, periodModifiers, periods, provenances, types } from './text'
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
      version: 'A',
      name: 'The Only Chapter',
      order: 1,
      manuscripts: [
        {
          id: 1,
          siglumDisambiguator: '1',
          museumNumber: 'BM.X',
          accession: 'X.1',
          periodModifier: 'Early',
          period: 'Ur III',
          provenance: 'Nippur',
          type: 'School',
          notes: 'a note',
          references: [{
            id: 'RN1853',
            linesCited: [],
            notes: '',
            pages: '34-54',
            type: 'DISCUSSION',
            document: { id: 'RN1853' }
          }]
        }
      ],
      lines: [
        {
          number: '1',
          reconstruction: 'reconstructed text',
          manuscripts: [
            {
              manuscriptId: 1,
              labels: ['o', 'iii'],
              number: 'a+1.',
              atf: 'kur'
            }
          ]
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
      version: 'A',
      name: 'The Only Chapter',
      order: 1,
      manuscripts: [
        {
          id: 1,
          siglumDisambiguator: '1',
          museumNumber: 'BM.X',
          accession: 'X.1',
          periodModifier: 'Early',
          period: 'Ur III',
          provenance: 'Nippur',
          type: 'School',
          notes: 'a note',
          references: [{
            id: 'RN1853',
            linesCited: [],
            notes: '',
            pages: '34-54',
            type: 'DISCUSSION'
          }]
        }
      ],
      lines: [
        {
          number: '1',
          reconstruction: 'reconstructed text',
          manuscripts: [
            {
              manuscriptId: 1,
              labels: ['o', 'iii'],
              number: 'a+1.',
              atf: 'kur'
            }
          ]
        }
      ]
    }
  ]
}

const text = createText({
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  numberOfVerses: 10,
  approximateVerses: true,
  chapters: List.of(
    createChapter({
      classification: 'Ancient',
      stage: 'Old Babylonian',
      version: 'A',
      name: 'The Only Chapter',
      order: 1,
      manuscripts: List.of(
        createManuscript({
          id: 1,
          siglumDisambiguator: '1',
          museumNumber: 'BM.X',
          accession: 'X.1',
          periodModifier: periodModifiers.get('Early'),
          period: periods.get('Ur III'),
          provenance: provenances.get('Nippur'),
          type: types.get('School'),
          notes: 'a note',
          references: List.of(new Reference(
            'DISCUSSION',
            '34-54',
            '',
            List(),
            new BibliographyEntry({ id: 'RN1853' })
          ))
        })
      ),
      lines: List.of(
        createLine({
          number: '1',
          reconstruction: 'reconstructed text',
          manuscripts: List.of(
            createManuscriptLine({
              manuscriptId: 1,
              labels: List.of('o', 'iii'),
              number: 'a+1.',
              atf: 'kur'
            })
          )
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
