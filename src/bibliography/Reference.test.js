import { Promise } from 'bluebird'
import { factory } from 'factory-girl'
import _ from 'lodash'
import { fromJS } from 'immutable'
import Reference, { createReference, serializeReference } from './Reference'
import BibliographyEntry from './BibliographyEntry'

test('default reference', () => {
  expect(new Reference()).toEqual(
    new Reference('DISCUSSION', '', '', [], new BibliographyEntry())
  )
})

describe('Reference', () => {
  let reference

  beforeEach(async () => {
    reference = await factory.build('reference')
  })

  test.each([['typeAbbreviation', 'type.0']])('%s', async (property, path) =>
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
      dto.get('linesCited').toJS(),
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

test('compactCitation', async () => {
  const reference = await factory.build('reference')
  const expected = `${reference.author}, ${reference.year}: ${
    reference.pages
  } [l. ${reference.linesCited.join(', ')}] (${reference.typeAbbreviation})`

  expect(reference.compactCitation).toEqual(expected)
})

test('Empty elements in compactCitation', async () => {
  const reference = await factory.build('reference', {
    pages: '',
    linesCited: []
  })
  expect(reference.compactCitation).toEqual(
    `${reference.author}, ${reference.year} (${reference.typeAbbreviation})`
  )
})

test('toHtml', async () => {
  const entry = await factory.build('bibliographyEntry')
  const reference = await factory.build('reference', { document: entry })
  expect(reference.toHtml()).toEqual(entry.toHtml())
})

function buildReferenceWithContainerTitle(type, cslData = {}) {
  return factory
    .build('cslDataWithContainerTitleShort', cslData)
    .then(cslData => factory.build('bibliographyEntry', cslData))
    .then(entry => factory.build('reference', { type: type, document: entry }))
}
test.each([
  [factory.build('reference'), false],
  [buildReferenceWithContainerTitle('PHOTO'), false],
  [buildReferenceWithContainerTitle('COPY'), true],
  [buildReferenceWithContainerTitle('EDITION'), true],
  [buildReferenceWithContainerTitle('DISCUSSION'), true],
  [buildReferenceWithContainerTitle('PHOTO', { id: 'RN2720' }), true],
  [buildReferenceWithContainerTitle('PHOTO', { id: 'RN2721' }), true]
])('useContainerCitation %#', async (factoryPromise, expected) => {
  const reference = await factoryPromise
  expect(reference.useContainerCitation).toEqual(expected)
})
