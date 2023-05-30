import _ from 'lodash'
import {
  bibliographyEntryFactory,
  buildReferenceWithContainerTitle,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import Reference, { groupReferences, ReferenceType } from './Reference'
import BibliographyEntry from './BibliographyEntry'

test('default reference', () => {
  expect(new Reference()).toEqual(
    new Reference('DISCUSSION', '', '', [], new BibliographyEntry())
  )
})

describe('getters', () => {
  let reference: Reference

  beforeEach(() => {
    reference = referenceFactory.build()
  })

  test.each([
    ['typeAbbreviation', 'type.0'],
    ['primaryAuthor', 'document.primaryAuthor'],
  ])('%s', (property, path) =>
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

test('groupReferences sorts groups', () => {
  const copy = referenceFactory.build({ type: 'COPY' })
  const discussion = referenceFactory.build({ type: 'DISCUSSION' })
  const edition = referenceFactory.build({ type: 'EDITION' })
  const photo = referenceFactory.build({ type: 'PHOTO' })
  const translation = referenceFactory.build({ type: 'TRANSLATION' })
  const archaeology = referenceFactory.build({ type: 'ARCHAEOLOGY' })

  expect(
    groupReferences([
      copy,
      discussion,
      edition,
      photo,
      translation,
      archaeology,
    ])
  ).toEqual([
    ['COPY', [copy]],
    ['PHOTO', [photo]],
    ['EDITION', [edition]],
    ['TRANSLATION', [translation]],
    ['DISCUSSION', [discussion]],
    ['ARCHAEOLOGY', [archaeology]],
  ])
})

test('groupReferences sorts references', () => {
  const type: ReferenceType = 'COPY'

  function buildReference(authors: string[], year: number): Reference {
    return referenceFactory.build(
      { type },
      {
        associations: {
          document: bibliographyEntryFactory.build(
            {},
            {
              transient: {
                author: authors.map((author) => ({
                  family: author,
                })),
                issued: { 'date-parts': [[year]] },
              },
            }
          ),
        },
      }
    )
  }

  const first = buildReference(['Ba'], 1950)
  const second = buildReference(['Ba'], 2000)
  const third = buildReference(['Ca', 'Aa'], 1900)

  expect(groupReferences([third, second, first])).toEqual([
    [type, [first, second, third]],
  ])
})
