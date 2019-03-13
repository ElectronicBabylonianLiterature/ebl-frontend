import { factory } from 'factory-girl'
import { fromJS, List } from 'immutable'
import _ from 'lodash'
import createFragment, { Fragment, Measures, Measure, RecordEntry, Line, Text, UncuratedReference } from './createFragment'
import Folio from 'fragmentarium/createFolio'

it('Creates fragment with folios', async () => {
  const dto = await factory.build('fragmentDto')
  const expected = new Fragment({
    number: dto._id,
    cdliNumber: dto.cdliNumber,
    bmIdNumber: dto.bmIdNumber,
    accession: dto.accession,
    publication: dto.publication,
    joins: dto.joins,
    description: dto.description,
    measures: new Measures(_(dto)
      .pick(['length', 'width', 'thickness'])
      .mapValues(measureDto => new Measure(measureDto))
      .value()
    ),
    collection: dto.collection,
    script: dto.script,
    folios: dto.folios.map(({ name, number }) => new Folio({ name, number })),
    record: dto.record.map(({ user, date, type }) => new RecordEntry({ user, date, type })),
    text: new Text({
      lines: List(dto.text.lines).map(
        ({ type, prefix, content }) => new Line({ type, prefix, content })
      )
    }),
    notes: dto.notes,
    museum: dto.museum,
    references: dto.references.map(reference => fromJS(reference)),
    uncuratedReferences: dto.uncuratedReferences && dto.uncuratedReferences.map(reference => new UncuratedReference({
      document: reference.document,
      lines: List(reference.lines)
    })),
    hits: dto.hits,
    atf: dto.atf,
    matchingLines: dto.matching_lines
      ? dto.matching_lines.map(line => fromJS(line))
      : []
  })

  expect(createFragment(dto)).toEqual(expected)
})
