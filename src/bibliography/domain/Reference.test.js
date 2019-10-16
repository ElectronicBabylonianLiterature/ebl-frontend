// @flow
import { Promise } from 'bluebird'
import { factory } from 'factory-girl'
import _ from 'lodash'
import { buildReferenceWithContainerTitle } from 'test-helpers/bibliography-fixtures'
import Reference from './Reference'
import serializeReference from 'bibliography/application/serializeReference'
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

  test.each([
    ['typeAbbreviation', 'type.0'],
    ['primaryAuthor', 'document.primaryAuthor']
  ])('%s', async (property, path) =>
    expect(reference[property]).toEqual(_.get(reference, path))
  )
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
