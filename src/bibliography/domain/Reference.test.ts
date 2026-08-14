import {
  bibliographyEntryFactory,
  buildReferenceWithContainerTitle,
  referenceFactory,
} from 'test-support/bibliography-fixtures'
import Reference, { groupReferences, ReferenceType } from './Reference'
import BibliographyEntry from './BibliographyEntry'

test('default reference', () => {
  expect(new Reference()).toEqual(
    new Reference('DISCUSSION', '', '', [], new BibliographyEntry()),
  )
})

describe('getters', () => {
  let reference: Reference

  beforeEach(() => {
    reference = referenceFactory.build()
  })

  test('primaryAuthor', () =>
    expect(reference.primaryAuthor).toEqual(reference.document.primaryAuthor))

  test('typeAbbreviation returns first letter for most types', () => {
    const ref = referenceFactory.build({ type: 'EDITION' })
    expect(ref.typeAbbreviation).toEqual('E')
  })

  test('typeAbbreviation returns "Ac" for ACQUISITION', () => {
    const ref = referenceFactory.build({ type: 'ACQUISITION' })
    expect(ref.typeAbbreviation).toEqual('Ac')
  })
})

describe('reference identity', () => {
  const compactReference = new Reference(
    'DISCUSSION',
    '12-13',
    'note',
    ['1.'],
    new BibliographyEntry(),
  ).withIdentity('RN52')

  test('a reference has no identity until one is assigned', () => {
    const reference = new Reference()

    expect(reference.referenceId).toEqual('')
  })

  test('a full reference falls back to its document id', () => {
    const entry = bibliographyEntryFactory.build()
    const reference = new Reference('COPY', '', '', [], entry).withIdentity(
      entry.id,
    )

    expect(reference.id).toEqual(entry.id)
  })

  test('a compact reference keeps its root id without a document', () => {
    expect(compactReference.id).toEqual('RN52')
    expect(compactReference.hasCitationMetadata).toBe(false)
  })

  test.each([
    ['setType', (reference: Reference) => reference.setType('COPY')],
    ['setPages', (reference: Reference) => reference.setPages('99')],
    ['setNotes', (reference: Reference) => reference.setNotes('changed')],
    [
      'setLinesCited',
      (reference: Reference) => reference.setLinesCited(['2.']),
    ],
  ])('%s preserves compact identity on the produced copy', (_name, copy) => {
    const copied = copy(compactReference)

    expect(copied).not.toBe(compactReference)
    expect(copied.id).toEqual('RN52')
  })

  test('setDocument adopts the newly selected document id', () => {
    const entry = bibliographyEntryFactory.build()
    const copied = compactReference.setDocument(entry)

    expect(copied).not.toBe(compactReference)
    expect(copied.referenceId).toEqual('')
    expect(copied.id).toEqual(entry.id)
    expect(compactReference.id).toEqual('RN52')
  })

  test('setters chained after setDocument keep the new document id', () => {
    const entry = bibliographyEntryFactory.build()
    const copied = compactReference
      .setDocument(entry)
      .setPages('99')
      .setNotes('changed')
      .setType('COPY')
      .setLinesCited(['2.'])

    expect(copied.id).toEqual(entry.id)
  })

  test('setDocument replaces an already resolved document id', () => {
    const entry = bibliographyEntryFactory.build()
    const replacement = bibliographyEntryFactory.build()
    const reference = new Reference('COPY', '', '', [], entry).withIdentity(
      entry.id,
    )

    expect(reference.setDocument(replacement).id).toEqual(replacement.id)
  })

  test('chained copies keep distinct ids for same-type compact references', () => {
    const other = new Reference(
      'DISCUSSION',
      '27',
      '',
      [],
      new BibliographyEntry(),
    ).withIdentity('RN54')
    const groupingKeys = [compactReference, other]
      .map((reference) => reference.setPages('').setLinesCited([]))
      .map((reference) => `${reference.id}-${reference.type}`)

    expect(groupingKeys).toEqual(['RN52-DISCUSSION', 'RN54-DISCUSSION'])
  })
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
  const acquisition = referenceFactory.build({ type: 'ACQUISITION' })
  const seal = referenceFactory.build({ type: 'SEAL' })

  expect(
    groupReferences([
      copy,
      discussion,
      edition,
      photo,
      translation,
      archaeology,
      acquisition,
      seal,
    ]),
  ).toEqual([
    ['COPY', [copy]],
    ['PHOTO', [photo]],
    ['EDITION', [edition]],
    ['TRANSLATION', [translation]],
    ['DISCUSSION', [discussion]],
    ['ARCHAEOLOGY', [archaeology]],
    ['ACQUISITION', [acquisition]],
    ['SEAL', [seal]],
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
            },
          ),
        },
      },
    )
  }

  const first = buildReference(['Ba'], 1950)
  const second = buildReference(['Ba'], 2000)
  const third = buildReference(['Ca', 'Aa'], 1900)

  expect(groupReferences([third, second, first])).toEqual([
    [type, [first, second, third]],
  ])
})
