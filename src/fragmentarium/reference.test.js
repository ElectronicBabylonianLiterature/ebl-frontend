import { Promise } from 'bluebird'
import { factory } from 'factory-girl'
import _ from 'lodash'
import Reference, { createReference, serializeReference } from './reference'

test('default reference', () => {
  expect(new Reference()).toEqual(
    new Reference('DISCUSSION', '', '', [], null)
  )
})

test.each([
  ['id', 'document.id'],
  ['author', 'document.author.0.family'],
  ['year', 'document.issued.date-parts.0.0'],
  ['title', 'document.title'],
  ['typeAbbreviation', 'type.0']
])('%s', async (property, path) => {
  const reference = await factory.build('reference')
  expect(reference[property]).toEqual(_.get(reference, path))
})

test('createReference', async () => {
  const entry = {}
  const bibliographyRepository = {
    find: jest.fn()
  }
  bibliographyRepository.find.mockReturnValueOnce(Promise.resolve(entry))
  const dto = await factory.build('referenceDto')
  await expect(createReference(dto, bibliographyRepository)).resolves.toEqual(
    new Reference(
      dto.type,
      dto.pages,
      dto.notes,
      dto.linesCited,
      entry
    )
  )
})

test('serializeReference', async () => {
  const reference = await factory.build('reference')
  expect(serializeReference(reference)).toEqual({
    id: reference.id,
    type: reference.type,
    pages: reference.pages,
    notes: reference.notes,
    linesCited: reference.linesCited
  })
})
