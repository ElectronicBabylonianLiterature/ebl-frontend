import { Promise } from 'bluebird'
import { factory } from 'factory-girl'
import _ from 'lodash'
import { fromJS } from 'immutable'
import Reference, { createReference, serializeReference } from './Reference'

test('default reference', () => {
  expect(new Reference()).toEqual(new Reference('DISCUSSION', '', '', [], null))
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

test.each([
  [factory.build('reference'), false],
  [
    factory
      .build('cslDataWithContainerTitleShort')
      .then(cslData => factory.build('bibliographyEntry', cslData))
      .then(entry =>
        factory.build('reference', { type: 'PHOTO', document: entry })
      ),
    false
  ],
  [
    factory
      .build('cslDataWithContainerTitleShort')
      .then(cslData => factory.build('bibliographyEntry', cslData))
      .then(entry =>
        factory.build('reference', { type: 'COPY', document: entry })
      ),
    true
  ],
  [
    factory
      .build('cslDataWithContainerTitleShort')
      .then(cslData => factory.build('bibliographyEntry', cslData))
      .then(entry =>
        factory.build('reference', { type: 'EDITION', document: entry })
      ),
    true
  ],
  [
    factory
      .build('cslDataWithContainerTitleShort')
      .then(cslData => factory.build('bibliographyEntry', cslData))
      .then(entry =>
        factory.build('reference', { type: 'DISCUSSION', document: entry })
      ),
    true
  ],
  [
    factory
      .build('cslDataWithContainerTitleShort', { id: 'RN2720' })
      .then(cslData => factory.build('bibliographyEntry', cslData))
      .then(entry =>
        factory.build('reference', { type: 'PHOTO', document: entry })
      ),
    true
  ],
  [
    factory
      .build('cslDataWithContainerTitleShort', { id: 'RN2721' })
      .then(cslData => factory.build('bibliographyEntry', cslData))
      .then(entry =>
        factory.build('reference', { type: 'PHOTO', document: entry })
      ),
    true
  ]
])('useContainerTitle %#', async (factoryPromise, expected) => {
  const reference = await factoryPromise
  expect(reference.useContainerTitle).toEqual(expected)
})
