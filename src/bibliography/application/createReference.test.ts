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
    new Reference(
      dto.type,
      dto.pages,
      dto.notes,
      dto.linesCited,
      entry,
    ).withIdentity(dto.id),
  )
})
test('preserves the root ID without a bibliography document', () => {
  const reference = createReference({
    id: 'SUMMARY-1',
    type: 'DISCUSSION',
    pages: '4-5',
    notes: 'Summary note',
    linesCited: ['2.'],
  })

  expect(reference.id).toEqual('SUMMARY-1')
  expect(reference.hasCitationMetadata).toBe(false)
  expect(reference.pages).toEqual('4-5')
  expect(reference.notes).toEqual('Summary note')
  expect(reference.linesCited).toEqual(['2.'])
})
