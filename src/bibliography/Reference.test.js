import { Promise } from 'bluebird'
import { factory } from 'factory-girl'
import _ from 'lodash'
import { fromJS } from 'immutable'
import Reference, { createReference, serializeReference } from './Reference'

test('default reference', () => {
  expect(new Reference()).toEqual(
    new Reference('DISCUSSION', '', '', [], null)
  )
})

describe('Reference', () => {
  let reference

  beforeEach(async () => {
    reference = await factory.build('reference')
  })

  test.each([
    ['typeAbbreviation', 'type.0']
  ])('%s', async (property, path) =>
    expect(reference[property]).toEqual(_.get(reference, path))
  )
})

test('createReference', async () => {
  const entry = await factory.build('bibliographyEntry')
  const bibliographyRepository = {
    find: jest.fn()
  }
  bibliographyRepository.find.mockReturnValueOnce(Promise.resolve(entry))
  const dto = fromJS(await factory.build('referenceDto'))
  await expect(createReference(dto, bibliographyRepository)).resolves.toEqual(
    new Reference(
      dto.get('type'),
      dto.get('pages'),
      dto.get('notes'),
      dto.get('linesCited'),
      entry
    )
  )
})

test('serializeReference', async () => {
  const reference = await factory.build('reference')
  expect(serializeReference(reference)).toEqual({
    id: reference.document.id,
    type: reference.type,
    pages: reference.pages,
    notes: reference.notes,
    linesCited: reference.linesCited
  })
})
