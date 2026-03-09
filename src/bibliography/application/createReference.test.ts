import Reference from 'bibliography/domain/Reference'
import createReference from './createReference'
import {
  cslDataFactory,
  referenceDtoFactory,
} from 'test-support/bibliography-fixtures'
import BibliographyEntry from 'bibliography/domain/BibliographyEntry'

test('createReference', () => {
  const cslData = cslDataFactory.build()
  const entry = new BibliographyEntry(cslData)
  const dto = referenceDtoFactory.build(
    {},
    { associations: { document: cslData } },
  )
  expect(createReference(dto)).toEqual(
    new Reference(dto.type, dto.pages, dto.notes, dto.linesCited, entry),
  )
})
