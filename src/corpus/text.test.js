
import { List } from 'immutable'
import _ from 'lodash'
import { factory } from 'factory-girl'
import Reference from 'bibliography/Reference'
import { Text, Chapter, Manuscript, periods, provenances, types } from './text'

describe('Text', () => {
  let config
  let text

  beforeEach(async () => {
    config = {
      category: 1,
      index: 1,
      name: 'Palm and Vine',
      numberOfVerses: 930,
      approximateVerses: true,
      chapters: List.of(
        new Chapter({
          classification: 'Ancient',
          stage: 'Neo-Babylonian',
          name: 'Morrigan',
          order: 77
        }),
        new Chapter({
          classification: 'Ancient',
          stage: 'Old Babylonian',
          name: 'IIc',
          order: 1,
          manuscripts: List.of(
            new Manuscript({
              uniqueId: 'abc-cde-123',
              siglumNumber: 1,
              museumNumber: 'BM.X',
              accession: 'X.1',
              period: periods.get('Ur III'),
              provenance: provenances.get('Nippur'),
              type: types.get('School'),
              note: 'some notes',
              references: List.of(new Reference(
                'DISCUSSION',
                '34-54',
                '',
                List(),
                await factory.build('bibliographyEntry')
              ))
            })
          )
        })
      )
    }
    text = new Text(config)
  })

  test.each(_.toPairs(config))('%s', (property, expected) => {
    expect(text[property]).toEqual(expected)
  })
})

describe('Chapter', () => {
  const config = {
    classification: 'Ancient',
    stage: 'Old Babylonian',
    name: 'III',
    order: -1,
    manuscripts: List.of(
      new Manuscript({
        uniqueId: 'abc-cde-123',
        siglumNumber: 1,
        museumNumber: 'BM.X',
        accession: 'X.1',
        stage: periods.get('Ur III'),
        provenance: provenances.get('Nippur'),
        type: types.get('School'),
        note: 'some notes',
        references: new List()
      })
    )
  }
  const chapter = new Chapter(config)

  test.each(_.toPairs(config))('%s', (property, expected) => {
    expect(chapter[property]).toEqual(expected)
  })
})

describe('Manuscript', () => {
  const config = {
    uniqueId: 'abc-cde-123',
    siglumNumber: 1,
    museumNumber: 'BM.X',
    accession: 'X.1',
    period: periods.get('Ur III'),
    provenance: provenances.get('Nippur'),
    type: types.get('School'),
    notes: 'some notes',
    references: new List()
  }

  const manuscript = new Manuscript(config)

  test.each(_.toPairs(config))('%s', (property, expected) => {
    expect(manuscript[property]).toEqual(expected)
  })
})
