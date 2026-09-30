import {
  bibliographyEntryFactory,
  cslDataFactory,
  referenceDtoFactory,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import createReference from 'bibliography/application/createReference'
import { ReferenceDto } from 'bibliography/domain/referenceDto'
import serializeReference from './serializeReference'

function buildPersistedReferenceDto(): ReferenceDto {
  return referenceDtoFactory.build(
    { id: 'RN52' },
    { associations: { document: cslDataFactory.build({ id: 'RN52' }) } },
  )
}

test('serializeReference', async () => {
  const reference = referenceFactory.build()
  expect(serializeReference(reference)).toEqual({
    id: reference.id,
    type: reference.type,
    pages: reference.pages,
    notes: reference.notes,
    linesCited: reference.linesCited,
  })
})

test('serializes the occurrence id of an unedited reference', () => {
  expect(
    serializeReference(createReference(buildPersistedReferenceDto())).id,
  ).toEqual('RN52')
})

test('serializes the newly selected document id after setDocument', () => {
  const replacement = bibliographyEntryFactory.build()
  const edited = createReference(buildPersistedReferenceDto()).setDocument(
    replacement,
  )

  expect(serializeReference(edited).id).toEqual(replacement.id)
})

test('keeps the newly selected document id through later edits', () => {
  const dto = buildPersistedReferenceDto()
  const replacement = bibliographyEntryFactory.build()
  const edited = createReference(dto)
    .setDocument(replacement)
    .setPages('99')
    .setNotes('changed')

  expect(serializeReference(edited)).toEqual({
    id: replacement.id,
    type: dto.type,
    pages: '99',
    notes: 'changed',
    linesCited: dto.linesCited,
  })
})
