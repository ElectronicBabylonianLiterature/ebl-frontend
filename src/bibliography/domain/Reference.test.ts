import _ from 'lodash'
import {
  bibliographyEntryFactory,
  buildReferenceWithContainerTitle,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import Reference from './Reference'
import BibliographyEntry from './BibliographyEntry'

test('default reference', () => {
  expect(new Reference()).toEqual(
    new Reference('DISCUSSION', '', '', [], new BibliographyEntry())
  )
})

describe('Reference', () => {
  let reference

  beforeEach(() => {
    reference = referenceFactory.build()
  })

  test.each([
    ['typeAbbreviation', 'type.0'],
    ['primaryAuthor', 'document.primaryAuthor'],
  ])('%s', async (property, path) =>
    expect(reference[property]).toEqual(_.get(reference, path))
  )
})

test('toHtml', () => {
  const entry = bibliographyEntryFactory.build()
  const reference = referenceFactory.build({ document: entry })
  expect(reference.toHtml()).toEqual(entry.toHtml())
})

test.each([
  [referenceFactory.build({ linesCited: [] }), false],
  [referenceFactory.build({ linesCited: ['1'] }), true],
])('hasLinesCited %#', (reference, expected) => {
  expect(reference.hasLinesCited).toEqual(expected)
})

test.each([
  [referenceFactory.build(), false],
  [buildReferenceWithContainerTitle('PHOTO'), true],
])('hasShortContainerTitle %#', (reference, expected) => {
  expect(reference.hasShortContainerTitle).toEqual(expected)
})
