// @flow
import { Promise } from 'bluebird'
import { factory } from 'factory-girl'
import _ from 'lodash'
import { buildReferenceWithContainerTitle } from 'test-helpers/bibliography-fixtures'
import Reference, { createReference, serializeReference } from './Reference'
import Citation, { CompactCitation, ContainerCitation } from './Citation'
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
  const dto = await factory.build('referenceDto')
  await expect(createReference(dto, bibliographyRepository)).resolves.toEqual(
    new Reference(dto.type, dto.pages, dto.notes, dto.linesCited, entry)
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

test('toHtml', async () => {
  const entry = await factory.build('bibliographyEntry')
  const reference = await factory.build('reference', { document: entry })
  expect(reference.toHtml()).toEqual(entry.toHtml())
})

test.each([
  [factory.build('reference', { linesCited: [] }), false],
  [factory.build('reference', { linesCited: ['1'] }), true]
])('hasLinesCited %#', async (factoryPromise, expected) => {
  const reference = await factoryPromise
  expect(reference.hasLinesCited).toEqual(expected)
})

test.each([
  [factory.build('reference'), false],
  [buildReferenceWithContainerTitle('PHOTO'), true]
])('hasShortContainerTitle %#', async (factoryPromise, expected) => {
  const reference = await factoryPromise
  expect(reference.hasShortContainerTitle).toEqual(expected)
})

test.each([
  [factory.build('reference'), CompactCitation],
  [buildReferenceWithContainerTitle('PHOTO'), CompactCitation],
  [buildReferenceWithContainerTitle('COPY'), ContainerCitation],
  [buildReferenceWithContainerTitle('EDITION'), ContainerCitation],
  [buildReferenceWithContainerTitle('DISCUSSION'), CompactCitation],
  [
    buildReferenceWithContainerTitle('PHOTO', { id: 'RN2720' }),
    ContainerCitation
  ],
  [
    buildReferenceWithContainerTitle('PHOTO', { id: 'RN2721' }),
    ContainerCitation
  ],
  [
    buildReferenceWithContainerTitle('DISCUSSION', { id: 'RN2720' }),
    ContainerCitation
  ],
  [
    buildReferenceWithContainerTitle('DISCUSSION', { id: 'RN2721' }),
    ContainerCitation
  ]
])('Citation.for %#', async (factoryPromise, ExpectedType) => {
  const reference = await factoryPromise
  expect(Citation.for(reference)).toEqual(new ExpectedType(reference))
})
