import { Promise } from 'bluebird'
import { createReference, createHydratedReference } from './createReference'

test('default reference', () => {
  expect(createReference()).toEqual({
    id: '',
    type: 'DISCUSSION',
    pages: '',
    notes: '',
    linesCited: [],
    document: null
  })
})

test('createReference', () => {
  expect(createReference('ID', 'PHOTO', '2', 'some notes', ['1.'])).toEqual({
    id: 'ID',
    type: 'PHOTO',
    pages: '2',
    notes: 'some notes',
    linesCited: ['1.'],
    document: null
  })
})

test('createHydratedReference', async () => {
  const bibliographyRepository = {
    find: jest.fn()
  }
  bibliographyRepository.find.mockReturnValueOnce(Promise.resolve({}))
  const reference = createReference('ID')
  await expect(createHydratedReference(reference, bibliographyRepository)).resolves.toEqual({
    ...reference,
    document: {}
  })
})
