
import { List } from 'immutable'
import _ from 'lodash'
import { Text, Chapter, Manuscript, periods, provenances, types, idTypes } from './text'

describe('Text', () => {
  const config = {
    category: 1,
    index: 1,
    name: 'Palm and Vine',
    chapters: List.of(
      new Chapter({
        classification: 'Ancient',
        stage: 'Neo-Babylonian',
        number: 1
      }),
      new Chapter({
        classification: 'Ancient',
        stage: 'Old Babylonian',
        number: 1,
        manuscripts: List.of(
          new Manuscript({
            uniqueId: 'abc-cde-123',
            siglum: 'UIII Nippur 1',
            idType: idTypes.first(),
            id: 'X.1',
            period: periods.get('Ur III'),
            provenance: provenances.get('Nippur'),
            type: types.get('School'),
            bibliography: new List()
          })
        )
      })
    )
  }
  const text = new Text(config)

  test.each(_.toPairs(config))('%s', (property, expected) => {
    expect(text[property]).toEqual(expected)
  })
})

describe('Chapter', () => {
  const config = {
    classification: 'Ancient',
    stage: 'Old Babylonian',
    number: 1,
    manuscripts: List.of(
      new Manuscript({
        uniqueId: 'abc-cde-123',
        siglum: 'UIII Nippur 1',
        idType: idTypes.first(),
        id: 'X.1',
        stage: periods.get('Ur III'),
        provenance: provenances.get('Nippur'),
        type: types.get('School'),
        bibliography: new List()
      })
    )
  }
  const chapter = new Chapter(config)

  test.each(_.toPairs(config))('%s', (property, expected) => {
    expect(chapter[property]).toEqual(expected)
  })
})

describe('Manuscript', () => {
  const config = new Manuscript({
    uniqueId: 'abc-cde-123',
    siglum: 'UIII Nippur 1',
    idType: idTypes.first(),
    id: 'X.1',
    period: periods.get('Ur III'),
    provenance: provenances.get('Nippur'),
    type: types.get('School'),
    bibliography: new List()
  })

  const manuscript = new Manuscript(config)

  test.each(_.toPairs(config))('%s', (property, expected) => {
    expect(manuscript[property]).toEqual(expected)
  })
})
